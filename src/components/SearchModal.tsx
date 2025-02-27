import { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiX, FiClock, FiTrash2 } from "react-icons/fi";
import debounce from "lodash/debounce";
import Cookies from "js-cookie";
import { SearchModalProps } from "../interfaces/SearchModalInterface";
import api from "../Utils/Api";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";
interface User {
  idUser: string;
  name: string;
  picture: string;
}

export function SearchModal({ isOpen, setIsOpen }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchInitialUsers = async (idUser: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chats/GetUsers?idUser=${idUser}`);
      setUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching initial users:", error);
      setIsLoading(false);
    }
  };

  const fetchUsers = async (query: string, idUser: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/chats/SearchUsers?query=${query}&idUser=${idUser}`
      );
      setUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  const ClickOnUser = async (idUser: string) => {
    try {
      const token = Cookies.get("token");
      if (token) {
        const response = await api.post(`/chats/AddChat`, {
          idUser1: jwtDecode<DecodedToken>(token)?.id_user,
          idUser2: idUser,
        });
        console.log("User added to chat:", response.data);
        setIsOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding user to chat:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string, idUser: string) => {
      fetchUsers(query, idUser);
    }, 300),
    []
  );

  useEffect(() => {
    const token = Cookies.get("token");

    if (searchQuery) {
      if (token) {
        const idUser = jwtDecode<DecodedToken>(token)?.id_user;
        debouncedSearch(searchQuery, idUser);
      }
    } else {
      if (token) {
        const idUser = jwtDecode<DecodedToken>(token)?.id_user;
        fetchInitialUsers(idUser);
      }
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  const handleSearchSubmit = (query: string) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev].slice(0, 5));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const memoizedUserCards = useMemo(
    () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {users.map((user) => (
          <div
            key={user.idUser}
            className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => ClickOnUser(user.idUser)}
          >
            <div className="flex flex-col items-center space-y-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce";
                }}
              />

              <h3 className="text-gray-800 font-medium text-center">
                {user.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    ),
    [users]
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl mx-4">
            <div className="p-4 border-b relative">
              <div className="flex items-center">
                <FiSearch className="w-6 h-6 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full p-2 outline-none text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit(searchQuery);
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700 font-medium">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <FiTrash2 className="w-4 h-4 mr-1" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                      >
                        <FiClock className="w-4 h-4" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your search.
                </div>
              ) : (
                memoizedUserCards
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchModal;
