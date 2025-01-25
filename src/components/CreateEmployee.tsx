import React, { useEffect, useState } from 'react'
import { Stepper, Step, Button } from "@material-tailwind/react";
import { HomeIcon, CogIcon, UserIcon } from "@heroicons/react/24/outline";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from 'axios';
import { ImBooks } from "react-icons/im";
import { GrSystem } from "react-icons/gr";
import { GiConfirmed } from "react-icons/gi";
import TimePicker from 'react-time-picker';
function CreateEmployee() {
  const [payloadData, setPayload] = useState([]);
  const [pageInfo, setPageInfo] = useState(1);

  // document File
  const [fileFields, setFileFields] = useState({
    qualificationFile: null,
    aadharCardFile: null,
    panCardFile: null,
    serviceAgreementFile: null,
  });

  // page 1
  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [relativeName, setRelativeName] = useState("");
  const [pemail, setPemail] = useState("");
  const [oemail, setOemail] = useState("");
  const [dob, setdob] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [gender, Setgender] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phone2, setPhone2] = useState("");
  const [phone2CountryCode, setPhone2CountryCode] = useState("+91");
  const [EmergencyPhone, setEmergencyPhone] = useState("");
  const [relation, setRelation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [formalTitle, setFormalTitle] = useState('');

  // page 2
  const [qualification, setQualification] = useState('');
  const [qualificationFile, setQualificationFile] = useState(null);
  const [aadharCardFile, setAadharCard] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [serviceAgreementFile, setServiceAgreementFile] = useState(null);
  const [degreeDesignation, setDegreeDesignation] = useState('');
  const [marksObtain, setMarksObtain] = useState('');
  const [panCardNum, setPanCardNum] = useState('');
  const [aadharCardNum, setAadharNumCard] = useState('');
  const [doj, setDoj] = useState('');

  // page 3
  const [departmentDropDown, setDepartmentDropDown] = useState([]);
  const [positionDropDown, setPositionDropDown] = useState([]);
  const [parentDropDown, setParentDropDown] = useState([]);
  const [empWorkShiftArray, setEmpWorkShiftArray] = useState([]);
  const [empDepartment, setEmpDepartment] = useState('');
  const [empPosition, setEmpPosition] = useState('');
  const [empParent, setEmpParent] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [tds_percent, setTds_percent] = useState('');
  const [rateMultiplier, setRateMultiplier] = useState('');
  const [p_incentive_c, setP_incentive_c] = useState(0);
  const [p_incentive_sc, setP_incentive_sc] = useState(0);
  const [assignment_check, setAssignment_check] = useState(0);
  const [assignment_no, setAssignment_no] = useState(0);
  const [empSalaryType, setEmpSalaryType] = useState('');
  const [empSalaryDeductionType, setEmpSalaryDeductionType] = useState('');
  const [empAutoAssign, setEmpAutoAssign] = useState(0);
  const [empAllowance, setEmpAllowance] = useState('');
  const [empIncentive, setEmpIncentive] = useState(0);
  const [empGrade, setEmpGrade] = useState('');
  const [empRenew, setEmpRenew] = useState(0);
  const [workShiftIn, setWorkShiftIn] = useState('10:00');
  const [workShiftOut, setWorkShiftOut] = useState('06:00');
  const [empWorkShiftGlobal, setEmpWorkShiftGlobal] = useState('');
  const [value, onChange] = useState('10:00');
  const [errors, setErrors] = useState({});


  const [empStatus, setEmpStatus] = useState('');
  const [empCreateUserAcc, setEmpCreateUserAcc] = useState('');
  const [empCalcSalary, setEmpCalcSalary] = useState('');
  const [empAssociate, setEmpAssociate] = useState('');
  const [empQualifier, setEmpQualifier] = useState('');
  const [empNoticePeriod, setEmpNoticePeriod] = useState('');
  const [noticeStartDate, setNoticeStartDate] = useState('0');
  const [noticeEndDate, setNoticeEndDate] = useState('0');
  const [exitDate, setExitDate] = useState('');
  // const [pageTitle , setPageTitle] = useState([]);

  const setPageTitle = [
    {
      "pageTitle": "personal",
      "icon": <GiConfirmed />,
      "condition": pageInfo > 1,
    },
    {
      "pageTitle": "Acedemic",
      "icon": <ImBooks />,
      "condition": pageInfo > 2,
    },
    {
      "pageTitle": "Salary",
      "icon": <GrSystem />,
      "condition": pageInfo > 3,
    },
    {
      "pageTitle": "Conformation",
      "icon": <GiConfirmed />,
      "condition": pageInfo > 4,
    }

  ]

  const submitBtn = () => {

    const payload = {
      fname: fname,
      mname: mname,
      lname: lname,
      relativeName: relativeName,
      personalEmail: pemail,
      officeEmail: oemail,
      dob: dob,
      address: address,
      pinCode: pinCode,
      city: city,
      gender: gender,
      phoneCountryCode: phoneCountryCode,
      phone: phone,
      phone2CountryCode: phone2CountryCode,
      phone2: phone2,
      EmergencyPhone: EmergencyPhone,
      relation: relation,
      empPosition: empPosition,
      empDepartment: empDepartment,
      qualification: qualification,
      qualificationFile: qualificationFile,
      aadharCardFile: aadharCardFile,
      panCardFile: panCardFile,
      serviceAgreementFile: serviceAgreementFile,
      degreeDesignation: degreeDesignation,
      marksObtain: marksObtain,
      panCardNum: panCardNum,
      aadharCardNum: aadharCardNum,
      doj: doj,
      maritalStatus: maritalStatus,
      formalTitle: formalTitle,
      empParent: empParent,
      baseSalary: baseSalary,
      tds_percent: tds_percent,
      rateMultiplier: rateMultiplier,
      p_incentive_c: p_incentive_c,
      empSalaryType: empSalaryType,
      empAutoAssign: empAutoAssign,
      empAllowance: empAllowance,
      empGrade: empGrade,
      empSalaryDeductionType: empSalaryDeductionType,
      empIncentive: empIncentive,
      empRenew: empRenew,
      empWorkShiftGlobal: empWorkShiftGlobal,
      workShiftIn: workShiftIn,
      workShiftOut: workShiftOut,
      empStatus: empStatus,
      empCreateUserAcc: empCreateUserAcc,
      empCalcSalary: empCalcSalary,
      empAssociate: empAssociate,
      empQualifier: empQualifier,
      empNoticePeriod: empNoticePeriod,
      noticeStartDate: noticeStartDate,
      noticeEndDate: noticeEndDate,
      exitDate: exitDate // Assuming 'exitDa' was a typo
    };

    setPayload(payload);
    console.log(payload);
    // payloadData
    try {
      axios.post("https://api.tickleright.in/api/employee/createEmployee", payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        if (res.data.error == 0) {
          console.log("no position found");
        } else {
          console.log("no position found");
        }
      })
    } catch (err) {
      console.log("Error" + err);
    }


  }

  useEffect(() => {
    const employeeDepartment = async () => {
      try {
        axios.get("https://api.tickleright.in/api/employee/selectDepartment").then((res) => {
          if (res.data.error == 0) {
            setDepartmentDropDown(res.data.data)
          } else {
            console.log("no position found");
          }
        })
      } catch (err) {
        console.log("Error" + err);
      }
    }
    employeeDepartment();
  }, []);

  useEffect(() => {
    const employeePosition = async () => {
      try {
        axios.get("https://api.tickleright.in/api/employee/selectPosition").then((res) => {
          if (res.data.error == 0) {
            setPositionDropDown(res.data.data)
          } else {
            console.log("no position found");
          }
        })
      } catch (err) {
        console.log("Error" + err);
      }
    }

    const employeeParent = async () => {
      try {
        axios.get("https://api.tickleright.in/api/employee/selectEmpParent").then((res) => {
          if (res.data.error == 0) {
            setParentDropDown(res.data.data)
          } else {
            console.log("no position found");
          }
        })
      } catch (err) {
        console.log("Error" + err);
      }
    }

    const employeeWorkShiftArray = async () => {
      try {
        axios.get("https://api.tickleright.in/api/employee/selectEmpWorkShift").then((res) => {
          if (res.data.error == 0) {
            setEmpWorkShiftArray(res.data.data)
          } else {
            console.log("no position found");
          }
        })
      } catch (err) {
        console.log("Error" + err);
      }
    }
    employeePosition();
    employeeParent();
    employeeWorkShiftArray();
  }, []);

  const changeValue = (e, valueToChange) => {
    valueToChange(e.target.value);
  }

  const handleChange = (e, stateToChange) => { //on change function
    stateToChange(e.target.value);
  };

  const handleCheckboxChange = (e, checkBoxValueSet) => {
    checkBoxValueSet(e.target.checked ? '1' : '0');
  };

  const previousPage = () => {
    if (pageInfo > 1)
      setPageInfo(pageInfo - 1);
  }

  const validatePage = () => {
    let currentErrors = {};

    if (pageInfo === 1) {
      if (!formalTitle.trim()) currentErrors.formalTitle = "Select Title";
      if (!fname.trim()) currentErrors.fname = "First name is required.";
      if (!mname.trim()) currentErrors.mname = "Middle name is required.";
      if (!lname.trim()) currentErrors.lname = "Last name is required.";
      if (!maritalStatus.trim()) currentErrors.maritalStatus = "Marital Status is required.";
      if (!relativeName.trim()) currentErrors.relativeName = "Relative name is required.";
      if (phone.length < 10) currentErrors.phone = "This phone number is either invalid or is in the wrong format'";
      if (phone2.length < 10) currentErrors.phone2 = "This phone number is either invalid or is in the wrong format'";
      // if (EmergencyPhone.length<10) currentErrors.EmergencyPhone = "This phone number is either invalid or is in the wrong format'";
      if (!pemail.trim()) {
        currentErrors.pemail = "Primary email is required.";
      } else if (!/\S+@\S+\.\S+/.test(pemail)) {
        currentErrors.pemail = "Primary email is invalid.";
      }
      if (!oemail.trim()) {
        currentErrors.oemail = "Other email is required.";
      } else if (!/\S+@\S+\.\S+/.test(oemail)) {
        currentErrors.oemail = "Other email is invalid.";
      }
      if (!dob.trim()) currentErrors.dob = "Date of birth is required.";

    } else if (pageInfo === 2) {
      if (!degreeDesignation.trim()) currentErrors.degreeDesignation = "Degree Designation is required.";
      if (!marksObtain.trim()) currentErrors.marksObtain = "Marks Obtain is required.";
      if (!panCardNum.trim()) currentErrors.panCardNum = "Pan Card Number is required.";
      if (!aadharCardNum.trim()) currentErrors.aadharCardNum = "Aadhar Card is required.";
    } else if (pageInfo === 3) {

    }

    // Add more validation for other pages if needed
    setErrors(currentErrors);
    // Return true if no errors
    return Object.keys(currentErrors).length === 0;
  };


  const fileChangeGlobal = (e, stateChanged) => {
    const res = handleFileChange(e);
    if (res == 1) {
      stateChanged(e);
    }
  }

  const handleFileChange = (fileData) => {
    const file = fileData;
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      if (!validTypes.includes(file.type)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          degreeDesignation: 'Unsupported file format. Please upload a PDF, DOC, DOCX, JPEG, or PNG file.',
        }));
        // setQualificationFile(null);
        return 3; //invalid format
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prevErrors => ({
          ...prevErrors,
          degreeDesignation: 'File size exceeds 5MB.',
        }));
        // setQualificationFile(null);
        return 2;
      }
      // setQualificationFile(file);
      setErrors(prevErrors => ({ ...prevErrors, file: null }));
      return 1;
    } else {
      // return null;
      setQualificationFile(null);
      setErrors(prevErrors => ({ ...prevErrors, degreeDesignation: 'Please upload your highest qualification file.' }));
    }
  };

  const nextPage = () => {
    // if (validatePage()) {
    setPageInfo(pageInfo + 1);
    // }
    if (pageInfo == 3) {
      var removeCountryPhone = phone.replace(phoneCountryCode, "");
      var removeCountryPhone2 = phone2.replace(phone2CountryCode, "");
      setPhone(removeCountryPhone);
      setPhone2(removeCountryPhone2);
    }
  }


  return (
    <>
      {/* <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-6">
        <li
          className={`flex md:w-full items-center 
          ${pageInfo > 1 ? 'text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500' : 'text-gray-600 dark:text-gray-500 after:border-gray-200 dark:after:border-gray-700'}
          sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10
        `}
        >
          <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            Personal <span className="hidden sm:inline-flex sm:ms-2">Info</span>
          </span>
        </li>
        <li className={`flex md:w-full items-center 
          ${pageInfo > 2 ? 'text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500' : 'text-gray-600 dark:text-gray-500 after:border-gray-200 dark:after:border-gray-700'}
          sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10
        `}>
          <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            <span className="me-2"> <ImBooks /></span>
            Academic <span className="hidden sm:inline-flex sm:ms-2">Info</span>
          </span>
        </li>
        <li className={`flex md:w-full items-center 
          ${pageInfo > 3 ? 'text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500' : 'text-gray-600 dark:text-gray-500 after:border-gray-200 dark:after:border-gray-700'}
          sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10
        `}>
          <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            <span className="me-2"><GrSystem /></span>
            System <span className="hidden sm:inline-flex sm:ms-2">Info</span>
          </span>
        </li>
        <li className="flex items-center">
          <span className="me-2"><GiConfirmed /></span>
          Confirmation
        </li>
      </ol> */}
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-6">
        {setPageTitle.map((data, index) => (
          <li key={index}
            className={`flex md:w-full items-center 
          ${data['condition'] ? 'text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500' : 'text-gray-600 dark:text-gray-500 after:border-gray-200 dark:after:border-gray-700'}
          sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 
        `}
          >
            <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
              <span className="me-2"> {data['icon']}</span>
              {data['pageTitle']} <span className="hidden sm:inline-flex sm:ms-2">Info</span>
            </span>
          </li>
        ))}
      </ol>
      {/*/ Hers the form Start */}
      {pageInfo == 1 &&
        <div className='form'>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div>
              <label htmlFor="genderSelect" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Select Formal Title
              </label>
              <select
                id="formalTitle"
                value={formalTitle}
                onChange={(e) => { handleChange(e, setFormalTitle) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose a formalTitle
                </option>
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
              </select>
              {errors.formalTitle && <span className="error text-red-600">{errors.formalTitle}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First name</label>
              <input type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="Raj" value={fname} onChange={(e) => { changeValue(e, setFname) }} required />
              {errors.fname && <span className="error text-red-600">{errors.fname}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Middle name</label>
              <input type="text" id="m_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="Kumar" onChange={(e) => { changeValue(e, setMname) }} value={mname} required />
              {errors.mname && <span className="error text-red-600">{errors.mname}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name</label>
              <input type="text" id="l_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="John" onChange={(e) => { changeValue(e, setLname) }} value={lname} required />
              {errors.lname && <span className="error text-red-600">{errors.lname}</span>}
            </div>

          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div>
              <label htmlFor="genderSelect" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Select Gender
              </label>
              <select
                id="genderSelect"
                value={gender}
                onChange={(e) => { handleChange(e, Setgender) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose a Gender
                </option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error text-red-600">{errors.gender}</span>}
            </div>
            <div>
              <label htmlFor="genderSelect" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Select Marital Status
              </label>
              <select
                id="genderSelect"
                value={maritalStatus}
                onChange={(e) => { handleChange(e, setMaritalStatus) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose a Marital Status
                </option>
                <option value="0">single</option>
                <option value="1">married</option>
                <option value="2">widowed</option>
                <option value="3">divorced</option>
                <option value="4">separated</option>
                <option value="5">registered partnership</option>
              </select>
              {errors.maritalStatus && <span className="error text-red-600">{errors.maritalStatus}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Contact</label>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={(value, data, event, formattedValue) => {
                  setPhoneCountryCode(data.dialCode); // Extract and set the country code
                  setPhone(value); // Set the phone number without the country code
                }}
                // onChange={(phone) => setPhone(phone)}
                inputStyle={{ width: '100%' }}
              />
              {errors.phone && <span className="error text-red-600">{errors.phone}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Contact 2</label>
              <PhoneInput
                country={"in"}
                value={phone2}
                onChange={(value, data, event, formattedValue) => {
                  setPhone2CountryCode(data.dialCode); // Extract and set the country code
                  setPhone2(value); // Set the phone number without the country code
                }}
                // onChange={(phone2) => setPhone2(phone2)}
                inputStyle={{ width: '100%' }}
              />
              {errors.phone2 && <span className="error text-red-600">{errors.phone2}</span>}
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-3 pr-10 pl-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Relative Name</label>
              <input type="text" id="relativeName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={relativeName} onChange={(e) => { changeValue(e, setRelativeName) }} placeholder="Relative Name" required />
              {errors.relativeName && <span className="error text-red-600">{errors.relativeName}</span>}
            </div>
            <div>
              <label htmlFor="relationSelect" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Select Relation
              </label>
              <select
                id="relationSelect"
                value={relation}
                onChange={(e) => { handleChange(e, setRelation) }}
                className="dark:text-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                     dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose a relation
                </option>
                <option value="Family" className="dark:text-white ">Family</option>
                <option value="Spouse" className="dark:text-white ">Spouse</option>
                <option value="Friend" className="dark:text-white ">Friend</option>
                <option value="Other" className="dark:text-white ">Other</option>
              </select>
              {errors.relation && <span className="error text-red-600">{errors.relation}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Emergency Contact</label>
              <PhoneInput
                country={"in"}
                value={EmergencyPhone}
                onChange={(EmergencyPhone) => setEmergencyPhone(EmergencyPhone)}
                inputStyle={{ width: '100%' }}
              />
              {errors.EmergencyPhone && <span className="error text-red-600">{errors.EmergencyPhone}</span>}
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-3 pr-10 pl-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date Of Birth</label>
              <input type="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={dob} onChange={(e) => { changeValue(e, setdob) }} placeholder="01-01-2000" required />
              {errors.dob && <span className="error text-red-600">{errors.dob}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Personal Email Id</label>
              <input type="text" id="personalMailId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={pemail} onChange={(e) => { changeValue(e, setPemail) }} placeholder="raj@gmail.com" required />
              {errors.pemail && <span className="error text-red-600">{errors.pemail}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Office Email Id</label>
              <input type="text" id="officeMailId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={oemail} onChange={(e) => { changeValue(e, setOemail) }} placeholder="raj@tickleright.com" required />
              {errors.oemail && <span className="error text-red-600">{errors.oemail}</span>}
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-3 pr-10 pl-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
              <input type="text" id="address" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={address} onChange={(e) => { changeValue(e, setAddress) }} placeholder="Address" required />
              {errors.address && <span className="error text-red-600">{errors.address}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
              <input type="text" id="city" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={city} onChange={(e) => { changeValue(e, setCity) }} placeholder="City" required />
              {errors.city && <span className="error text-red-600">{errors.city}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pin Code</label>
              <input type="text" id="officeMailId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={pinCode} onChange={(e) => { changeValue(e, setPinCode) }} placeholder="400070" required />
            </div>
          </div>
        </div>
      }

      {pageInfo == 2 &&
        <div className='form'>
          <div className="grid gap-6 mb-6 md:grid-cols-1 pr-10 pl-10">
            <h6 className="text-2xl md:text-2xl pl-2 my-2 border-l-4  font-sans font-bold border-pink-400  dark:text-gray-200">
              Academic Info
            </h6>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Highest Qualification</label>
              <select
                id="highest_qualification"
                value={qualification}
                onChange={(e) => { handleChange(e, setQualification) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose Highest Qualification
                </option>
                <option value="No formal education">No formal education</option>
                <option value="Primary education">Primary education</option>
                <option value="Secondary education">Secondary education or high school</option>
                <option value="GED">GED</option>
                <option value="Vocational qualification">Vocational qualification</option>
                <option value="Bachelor's degree">Bachelor's degree</option>
                <option value="Master's degree">Master's degree</option>
                <option value="Doctorate or higher">Doctorate or higher</option>
              </select>
              {/* {errors.qualification && <span className="error text-red-600">{errors.qualification}</span>} */}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Degree Specification</label>
              <input type="text" id="degree_designation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="bachelor of science in information technology" value={degreeDesignation} onChange={(e) => { changeValue(e, setDegreeDesignation) }} required />
              {/* {errors.degreeDesignation && <span className="error text-red-600">{errors.degreeDesignation}</span>} */}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Marks Obtain (CGPA)</label>
              <input type="text" id="marks" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="bachelor of science in information technology" value={marksObtain} onChange={(e) => { changeValue(e, setMarksObtain) }} required />
              {/* {errors.marksObtain && <span className="error text-red-600">{errors.marksObtain}</span>} */}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload File Of Highest Qualification</label>
              <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" id="file_input" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => { fileChangeGlobal(e.target.files[0], setQualificationFile) }} />
              {errors.degreeDesignation && <span className="error text-red-600">{errors.degreeDesignation}</span>}
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <h6 className="text-2xl md:text-2xl pl-2 my-2 border-l-4  font-sans font-bold border-pink-400  dark:text-gray-200">
              Legal Documents
            </h6>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Aadhar Card Number</label>
              <input type="text" id="aadhar_card" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" name='setAadharNumCard' placeholder="1234 5678 4321" maxLength="12" value={aadharCardNum} onChange={(e) => { changeValue(e, setAadharNumCard) }} required />
              {errors.aadharCardNum && <span className="error text-red-600">{errors.aadharCardNum}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Aadhar Card</label>
              <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" id="file_input" name='setAadharCard' type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => { fileChangeGlobal(e.target.files[0], setAadharCard) }} />
              {errors.setAadharCard && <span className="error text-red-600">{errors.setAadharCard}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pan Card Number</label>
              <input type="text" id="aadhar_card" className="uppercase bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" name='setPanCardNum' placeholder="1234 5678 4321" maxLength="10" value={panCardNum} onChange={(e) => { changeValue(e, setPanCardNum) }} required />
              {errors.panCardNum && <span className="error text-red-600">{errors.panCardNum}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pan Card</label>
              <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" id="file_input" type="file" name='setPanCardFile' accept=".pdf,.doc,.docx,image/*" onChange={(e) => { fileChangeGlobal(e.target.files[0], setPanCardFile) }} />
              {errors.panCardFile && <span className="error text-red-600">{errors.panCardFile}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Service Agreement</label>
              <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" id="file_input" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => { fileChangeGlobal(e.target.files[0], setServiceAgreementFile) }} />
              {errors.setServiceAgreementFile && <span className="error text-red-600">{errors.setServiceAgreementFile}</span>}
            </div>
          </div>
        </div>
      }

      {pageInfo == 3 &&
        <div className='form'>
          <div className="grid gap-6 mb-6 md:grid-cols-1 pr-10 pl-10">
            <h6 className="text-2xl md:text-2xl pl-2 my-2 border-l-4  font-sans font-bold border-pink-400  dark:text-gray-200">
              System Info
            </h6>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
              <select
                id="Choose Department"
                value={empDepartment}
                onChange={(e) => { handleChange(e, setEmpDepartment) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose Department
                </option>
                {departmentDropDown && departmentDropDown.map((ditem) => (
                  <option key={ditem['id']} value={ditem['id']}>{ditem['department']}</option>
                ))}
              </select>
              {errors.empDepartment && <span className="error text-red-600">{errors.empDepartment}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
              <select
                id="Choose Position"
                value={empPosition}
                onChange={(e) => { handleChange(e, setEmpPosition) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose Position
                </option>
                {positionDropDown && positionDropDown.filter(itemPosition => itemPosition['department_id'] == empDepartment).map((itemPosition) => (
                  <option key={itemPosition['id']} value={itemPosition['parent_id']}>{itemPosition['position']}</option>
                ))}
              </select>
              {errors.empPosition && <span className="error text-red-600">{errors.empPosition}</span>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Parent</label>
              <select
                id="Choose Parent"
                value={empParent}
                onChange={(e) => { handleChange(e, setEmpParent) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose Position
                </option>
                {parentDropDown && parentDropDown.filter(itemParent => itemParent.position_id == empPosition).map((itemParent) => (
                  <option key={itemParent['id']} value={itemParent['id']}>{itemParent['fullname']}</option>
                ))}
              </select>
              {errors.empParent && <span className="error text-red-600">{errors.empParent}</span>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date Of Joining</label>
              <input type="date" id="doj" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={doj} onChange={(e) => { changeValue(e, setDoj) }} placeholder="01-01-2000" required />
              {errors.doj && <span className="error text-red-600">{errors.doj}</span>}
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div className="col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Base Salary</label>
              <input type="text" id="base_salary" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20000" value={baseSalary} onChange={(e) => { changeValue(e, setBaseSalary) }} required />
              {errors.baseSalary && <span className="error text-red-600">{errors.baseSalary}</span>}
            </div>


            <div className="col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Salary Type</label>
              <select
                id="Choose Salary Type"
                value={empSalaryType}
                onChange={(e) => { handleChange(e, setEmpSalaryType) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Select Salary Type
                </option>
                <option value="1">Basic salary</option>
                <option value="2">Fixed salary </option>
                <option value="3">Per hour Payout</option>
                <option value="4">Per Child Payout</option>
                <option value="5">Per hour (minimum Gaurentee) salary </option>
                <option value="6">Hybrid</option>
              </select>
              {errors.empSalaryType && <span className="error text-red-600">{errors.empSalaryType}</span>}
            </div>

            <div className="col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Salary Deduction Type</label>
              <select
                id="Choose Deduction Type"
                value={empSalaryDeductionType}
                onChange={(e) => { handleChange(e, setEmpSalaryDeductionType) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Select Deduction Type
                </option>
                <option value="1">None</option>
                <option value="2">P.T</option>
                <option value="3">TDS</option>
              </select>
              {errors.empSalaryDeductionType && <span className="error text-red-600">{errors.empSalaryDeductionType}</span>}
            </div>
            <div className="col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rate Multiplier</label>
              <input type="text" id="rateMultiplier" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20000" value={rateMultiplier} onChange={(e) => { changeValue(e, setRateMultiplier) }} required />
              {errors.rateMultiplier && <span className="error text-red-600">{errors.rateMultiplier}</span>}
            </div>

            
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            {empPosition == '7' &&
              <div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">P_incentive_c</label>
                  <input type="text" id="p_incentive_c" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20000" value={p_incentive_c} onChange={(e) => { changeValue(e, setP_incentive_c) }} required />
                  {errors.p_incentive_c && <span className="error text-red-600">{errors.p_incentive_c}</span>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">P_incentive_Sc</label>
                  <input type="text" id="p_incentive_sc" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20000" value={p_incentive_sc} onChange={(e) => { changeValue(e, setP_incentive_sc) }} required />
                  {errors.p_incentive_sc && <span className="error text-red-600">{errors.p_incentive_sc}</span>}
                </div>
              </div>
            }
            {empSalaryDeductionType == '3' &&
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">TDS Percentage</label>
                <input type="text" id="tds_percent" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="10" value={tds_percent} onChange={(e) => { changeValue(e, setTds_percent) }} required />
                {errors.tds_percent && <span className="error text-red-600">{errors.tds_percent}</span>}
              </div>
            }

          </div>

          {empPosition && empPosition === '31' && empDepartment === '3' &&
            <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Auto Assign Inquiry</label>
                <select
                  id="Choose Salary Type"
                  value={empAutoAssign}
                  onChange={(e) => { handleChange(e, setEmpAutoAssign) }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                >
                  <option value="" disabled>
                    Select Salary Type
                  </option>
                  <option value="0">Off</option>
                  <option value="1">Online Form</option>
                  <option value="2">Facebook and Google</option>
                  <option value="3">Both</option>
                </select>
                {errors.empAutoAssign && <span className="error text-red-600">{errors.empAutoAssign}</span>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Incentive</label>
                <input type="text" id="incentive" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="200 %" value={empIncentive} onChange={(e) => { changeValue(e, setEmpIncentive) }} required />
                {errors.empIncentive && <span className="error text-red-600">{errors.empIncentive}</span>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Renew</label>
                <input type="text" id="renew" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="200 %" value={empRenew} onChange={(e) => { changeValue(e, setEmpRenew) }} required />
                {errors.empRenew && <span className="error text-red-600">{errors.empRenew}</span>}
              </div>
            </div>
          }
          {empPosition && empPosition == '48'  && empDepartment =='8' &&
            <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={assignment_check} checked={assignment_check === '1'} onChange={(e) => { handleCheckboxChange(e, setAssignment_check) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Assingment check</label>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Assignment no</label>
                <input type="text" id="assignment_no" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20000" value={assignment_no} onChange={(e) => { changeValue(e, setAssignment_no) }} required />
                {errors.assignment_no && <span className="error text-red-600">{errors.assignment_no}</span>}
              </div>
            </div>
          }
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
          <div className="col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Allowance</label>
              <input type="text" id="allowance" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" placeholder="20" value={empAllowance} onChange={(e) => { changeValue(e, setEmpAllowance) }} required />
              {errors.empAllowance && <span className="error text-red-600">{errors.empAllowance}</span>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">WorkShift Hours In</label>
              <div className="relative">
                <input type="time" id="intime" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" min="09:00" max="18:00" value={workShiftIn} onChange={(e) => { changeValue(e, setWorkShiftIn) }} required />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">WorkShift Hours In</label>
              <div className="relative">
                <input type="time" id="outTime" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" min="09:00" max="18:00" value={workShiftOut} onChange={(e) => { changeValue(e, setWorkShiftOut) }} required />
              </div>

            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Work-Shift</label>
              <select
                id="Choose Work-Shift"
                value={empWorkShiftGlobal}
                onChange={(e) => { handleChange(e, setEmpWorkShiftGlobal) }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                    focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
              >
                <option value="" disabled>
                  Choose Work-Shift
                </option>
                {empWorkShiftArray && empWorkShiftArray.map((workItem) => (
                  <option key={workItem['id']} value={workItem['id']}>{workItem['workshift']}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-4 pr-10 pl-10">
            <div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empStatus} checked={empStatus === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpStatus) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Active</label>
              </div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empCreateUserAcc} checked={empCreateUserAcc === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpCreateUserAcc) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Create User Account</label>
              </div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empCalcSalary} checked={empCalcSalary === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpCalcSalary) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Calculate Salary</label>
              </div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empAssociate} checked={empAssociate === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpAssociate) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Associate</label>
              </div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empQualifier} checked={empQualifier === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpQualifier) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Qualifier</label>
              </div>
              <div className="flex items-center">
                <input id="checked-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" value={empNoticePeriod} checked={empNoticePeriod === '1'} onChange={(e) => { handleCheckboxChange(e, setEmpNoticePeriod) }} />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Notice Period</label>
              </div>


            </div>
            {empNoticePeriod === '1' &&
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notice Start Date</label>
                <input type="date" id="noticeStartDate" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={noticeStartDate} onChange={(e) => { changeValue(e, setNoticeStartDate) }} placeholder="01-01-2000" required />
              </div>
            }
            {empNoticePeriod === '1' &&
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notice End Date</label>
                <input type="date" id="noticeEndDate" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={noticeEndDate} onChange={(e) => { changeValue(e, setNoticeEndDate) }} placeholder="01-01-2000" required />
              </div>
            }
            {empNoticePeriod === '1' &&
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Exit Date</label>
                <input type="date" id="exitDate" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-80 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" value={exitDate} onChange={(e) => { changeValue(e, setExitDate) }} placeholder="01-01-2000" required />
              </div>
            }

          </div>
        </div>
      }
      {
        pageInfo == 4 &&
        <div className='justify-items-center w-full mt-9'>
          <div id="toast-success" className="w-180 p-4 mb-4 text-gray-500 bg-white rounded-lg shadow shadow-purple-600 dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div id="toast-success" className="flex items-center mb-4">

              <div className="mr-5 inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="sr-only">Check icon</span>
              </div>
              <div className="text-sm w-full font-semibold"> <b> Please Verify All Employee Details Before System Entry</b></div>
            </div>

            <div className="text-sm font-normal">
              <b className='text-red-700'>Before creating a new employee record in the system, ensure that all provided information is accurate and complete. This includes:</b>

              <p>Personal Information: Full name, contact details, date of birth, and identification numbers.
                Employment Details: Job title, department, start date, and supervisor information.
                Credentials: Required certifications, licenses, and access permissions.
                Documentation: Signed contracts, agreements, and any necessary compliance forms.
                Taking the time to thoroughly check each detail helps maintain data integrity and ensures a smooth onboarding process.</p>
            </div>
          </div>
          <button type="button" className="mr-10 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 float-end focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800" onClick={() => { submitBtn() }}>
            Create Emp
          </button>
        </div>

      }
      {
        pageInfo > 1 &&
        <button type="button" className="mx-10 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800" onClick={() => { previousPage() }}>
          Previous Step: {setPageTitle[pageInfo - 2]['pageTitle']}
        </button>
      }
      {
        pageInfo <= 3 &&
        <button type="button" className="mr-10 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 float-end focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800" onClick={() => { nextPage() }}>
          Next Step: {setPageTitle[pageInfo]['pageTitle']}
        </button>
      }
      {/* {pageInfo == 4 && } */}
    </>
  );
}

export default CreateEmployee