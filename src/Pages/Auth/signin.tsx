import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { FaRegEye, FaRegEyeSlash, FaRegUserCircle } from "react-icons/fa";
import { Boxes } from '@/components/ui/background-boxes';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; 
import { useDispatch, useSelector } from 'react-redux';
import {
  ApiAddress,
  MediaDrop,
  btoken,
  sourcedestination,
  userType,
  usercat,
  user_Name,
  sessionOut
} from '@/Redux/tableDropFilter';
import { RootState } from '@/Redux/Store'; 
import { useNavigate } from 'react-router';
import { useToast } from '../../components/hooks/use-toast';

interface Config {
  apiUrl: string;
  featureFlag: boolean;
  otherSetting: string;
}

export const useLoginMutation = (IpAddress: string) => {
  const mutation = useMutation({
    mutationFn: async ({ userName, password }: { userName: string; password: string }) => {
      const response = await axios.post(`http://${IpAddress}:7001/internal/api/login`, {
        user: userName,
        password,
      });
      return response.data;
    },
    retry: false,
  });

  return mutation;
};


const SignIn: React.FC = () => {
  const { toast, dismiss } = useToast();
  const [eyeOpen, setEyeOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [IpAddress, setIpAddress] = useState<string | null>(null);

  const Dispatch = useDispatch();
  const navigate = useNavigate();
  const SessionOut = useSelector((state: RootState) => state.tableDownClick.sessionOut);
  const queryClient = useQueryClient();
  const { mutate, isPending, reset } = useLoginMutation(IpAddress || "");
  // Load config
  useEffect(() => {
    axios.get('./config.json')
      .then(response => {
        setIpAddress(response.data.apiUrl);
        Dispatch(ApiAddress(response.data.apiUrl));
        sessionStorage.setItem("ipAddress", response.data.apiUrl);
      })
      .catch(error => {
        console.error("Error loading config:", error);
      });
  }, []);

  // Handle session timeout
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (SessionOut) {
  //       toast({
  //         duration: 45000,
  //         variant: "destructive",
  //         description: "Session expired",
  //       });
  //     }
  //   }, 100);
  //   return () => clearTimeout(timeout);
  // }, [toast, SessionOut]);

  useEffect(() => {
    // Forcefully reset the login mutation (important after redirect)
    reset();

    // Optional: clear any session timeout flag
    if (sessionStorage.getItem("SessionNotif")) {
      toast({
        description: "Session expired. Please log in again.",
        variant: "destructive",
      });
      sessionStorage.removeItem("SessionNotif");
    }
  }, [reset]);


  const toggleEye = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    setEyeOpen(!eyeOpen);
  };

  console.log(isPending, "pending")


  useEffect(() => {
    reset(); // Clean up any pending or error state when login page loads 
    queryClient.clear();
    sessionStorage.clear();
  }, []);

  const checkAuthentication = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    dismiss();

    if (!IpAddress) {
      setError("Config not loaded yet. Please wait...");
      return;
    }

    mutate(
      { userName, password },
      {
        onSuccess: (data) => {
          Dispatch(sessionOut(false));
          Dispatch(btoken(data.sessionID));
          Dispatch(sourcedestination(data.sourcedestination));
          Dispatch(MediaDrop(data.media));
          Dispatch(usercat(data.catgeory));
          Dispatch(userType(data.userType));
          Dispatch(user_Name(userName));

          sessionStorage.setItem("userType", data.userType);
          sessionStorage.setItem("Session", data.sessionID);
          sessionStorage.setItem("Dropdown", JSON.stringify(data.sourcedestination));
          sessionStorage.setItem("Media", JSON.stringify(data.media));
          sessionStorage.setItem("userCategory", JSON.stringify(data.catgeory));
          sessionStorage.setItem("user_Name", userName);

          navigate("/Request");
        },
        onError: (error: any) => {
          if (error.response?.data?.status === 1004) {
            setError("Invalid Credential");
          } else {
            setError("Manager Down");
          }
        },
      }
    );
  }, [userName, password, IpAddress, Dispatch, navigate, dismiss, mutate]);

  return (
    <div className="h-screen relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
      <Boxes />
      <div className="relative z-[1] max-w-screen-xl pt-4 md:p-6 2xl:p-10 rounded-sm border-2 border-white shadow-default dark:bg-boxdark w-[75%] 2xl:w-2/6 lg:w-2/5 m-auto">
        <div className="flex flex-wrap items-center">
          <div className="w-full border-stroke dark:border-strokedark">
            <div className="w-full p-4 sm:p-12.5 xl:p-5.5">
              <div className="flex items-center justify-between gap-2 px-6">
                <div className="block m-auto p-auto">
                  <img src="./img/Logo.png" alt="logo" width={90} height={70} loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              </div>
              <form onSubmit={checkAuthentication}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    User Name
                  </label>
                  <div className="relative">
                    <input
                      required
                      autoFocus
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      type="text"
                      placeholder="Enter your User-Name"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    <span className="absolute right-4 top-5">
                      <FaRegUserCircle className="h-5 w-8 mr-1" />
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={eyeOpen ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    <span className="absolute right-4 top-5">
                      {eyeOpen ? (
                        <FaRegEyeSlash className="h-5 w-8 mr-1" onClick={toggleEye} />
                      ) : (
                        <FaRegEye className="h-5 w-8 mr-1" onClick={toggleEye} />
                      )}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  {!isPending ? (
                    <input
                      type="submit"
                      value="Sign In"
                      className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 dark:bg-[#313d4a]"
                    />
                  ) : (
                    <div className='mb-5 flex items-center justify-center'>
                      <div role="status">
                        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-5 w-full text-center p-4 text-red-500 font-medium text-lg subpixel-antialiased">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
