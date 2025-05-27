import { Link } from 'react-router-dom';
import LogoDark from '../../images/logo/logo-dark.svg';
import Logo from '../../images/logo/logo.png';
import bg_img from '../../images/logo/bg_img.webp';
import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import "react-phone-input-2/lib/bootstrap.css";
import PhoneInput from "react-phone-input-2";
import { del, get, post, put } from "../../helpers/api_helper";
const SignIn = () => {
  // const [pinValue, setPinValue] = useState('')
  const [pinValue, setPinValue] = useState<string>('+91'); // Default to India

  const [passwordValue, setPassword] = useState('')
  const [mobileValue, setMobileValue] = useState('')
  const options = useMemo(() => countryList().getData(), [])
  const [showAlertSeverity, setAlertSeverity] = useState('false');
  const [showAlertMsg, setAlertMsg] = useState('false');
  if (localStorage.getItem('token') != null) {
    window.location.href = '/profile'
  }
  const changeHandler = (e, stateValue) => {
    var val = e.target == null || e.target == undefined ? e : e.target.value
    stateValue(val)
  }
  const handlePhoneChange = (value: string, data: any) => {
    setPinValue(data.dialCode);
    setMobileValue(value.slice(data.dialCode.length));
  };
  const sign_in = async () => {
    if (passwordValue == '' || pinValue == '' || mobileValue == '') {
      setAlertSeverity('true');
      setAlertMsg('please enter your password')
    } else {
      const formData = {
        country_code: '+' + pinValue,
        mobile: mobileValue,
        password: passwordValue,
      }
      try {
        const response = await post("/sign_in", formData, {});
        if (response.data.error == '0') {
          localStorage.clear();

          await Promise.all([
            localStorage.setItem('token', response.token),
            localStorage.setItem('user_id', response.data.user_id),
            localStorage.setItem('contact_id', response.data.contact_id),
            getUserData()
          ]);
          window.location.href = '/profile'
          // window.location.href = '/pi/pi-casting'
        }
        else {
          setAlertSeverity('true');
          setAlertMsg(response.data.message)
          return;
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    }
  }

  const getUserData = async () => {
    var contact_id = localStorage.getItem('contact_id');
    var user_id = localStorage.getItem('user_id');
    var payload = {
      "contact_id": contact_id,
      "user_id": user_id,
    };
    try {
      const response = await post("get_user_data", payload, {});
      if (response.error == 0) {
        localStorage.setItem('contact_data', JSON.stringify(response.data[0]));
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };
  function dismissAlert() {
    const alert = document.getElementById('alert-border-4');
    if (alert) {
      alert.style.display = 'none';
      setAlertSeverity('false');
    }
  }

  setTimeout(dismissAlert, 3000);

  return (
    <>
      <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {showAlertSeverity == 'true' &&
          <div id="alert-border-4" className="fixed w-full flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800" role="alert">
            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="ms-3 text-sm font-medium">
              {showAlertMsg}
            </div>
          </div>
        }
        {/* <div className="h-full flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">

              <img className="pl-50 h-75" src={Logo} alt="Logo" />

            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign In to Tickle-Right
              </h2>

              <form>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Mobile No
                  </label>
                  <div className="">
                    <div className='py-2 col-start-2 col-end-1'>
                      <PhoneInput
                        inputStyle={{
                          width: '100%',
                          height: '45px',
                          fontSize: '16px',
                          paddingLeft: '48px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: 'transparent'
                        }}
                        country={"eg"}
                        enableSearch={true}
                        value={pinValue + mobileValue}
                        onChange={(value, data) => handlePhoneChange(value, data)}
                      />
                    </div>

                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>

                  <div className="relative">
                    <span className="absolute left-4.5 top-4">
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.5">
                          <path
                            d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                            fill=""
                          />
                          <path
                            d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                            fill=""
                          />
                        </g>
                      </svg>
                    </span>
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-15 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" onChange={(e) => changeHandler(e, setPassword)}
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <input
                    type="button"
                    value="Sign In" onClick={() => sign_in()}
                    className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                  />
                </div>

                <div className="mt-6 text-center">
                  <p>
                    Don’t have any account?{' '} please contact admins
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div> */}
        {/* <div className='h-fit w-fit bg-white'>
          <img src={bg_img} alt="bg_img" className='max-h-fit w-full' />
        </div> */}
        <div className='flex justify-center items-center h-screen'>
          <div className='h-150 w-203 border-2 relative'>
            <div className='absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white p-2'>
              <img src={Logo} alt="Logo" className='h-20 w-20' />
            </div>
            <div className='flex justify-center items-center mt-16'>
              <h2 className='text-2xl font-bold text-black dark:text-white sm:text-title-xl2'>
                Sign In to Tickle-Right
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
