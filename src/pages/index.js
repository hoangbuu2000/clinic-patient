import {
    AppBar, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Divider, Grid, IconButton, makeStyles, MenuItem, Paper, Slide, Step, StepLabel, Stepper, Tab,
    Table, TableBody, TableHead, TableCell, TableContainer, TableRow, Tabs, TextField, Toolbar, Tooltip, Typography
} from "@material-ui/core";
import { TextValidator, SelectValidator, ValidatorForm } from "react-material-ui-form-validator";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import React, { useEffect, useRef, useState } from "react";
import ScrollToTop from "../components/ScrollTopTop";
import swal from "sweetalert";
import API, { endpoints } from "../../src/API";
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DataTable from "../components/DataTable";
import InfoIcon from '@material-ui/icons/Info';
import { useHistory } from "react-router";
import { url } from "../../src/URL";
import Login from "../components/Login";
import Register from "../components/Register";
import Paypal from "../components/Paypal";
import EditIcon from '@material-ui/icons/Edit';
import { EditAttributes, StayCurrentPortrait } from "@material-ui/icons";
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import FavoriteIcon from '@material-ui/icons/Favorite';
import HealingIcon from '@material-ui/icons/Healing';
import PersonIcon from '@material-ui/icons/Person';
import TodayIcon from '@material-ui/icons/Today';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import QRCode from 'qrcode.react';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { Pagination } from "@material-ui/lab";
import AssignmentIcon from '@material-ui/icons/Assignment';
import HearingIcon from '@material-ui/icons/Hearing';
import FeedbackIcon from '@material-ui/icons/Feedback';
import "firebase/auth";
import { getDatabase, set, ref, push, onValue } from "firebase/database";
import { getFirestore, collection, where, query, getDocs, onSnapshot } from "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { v4 as uuidv4 } from 'uuid';
import Chat from "../components/Chat";
import AOS from 'aos';
import "aos/dist/aos.css";

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

let imgUrl = process.env.PUBLIC_URL + '/images/gui2.jpg';

export const CurrentUserContext = React.createContext();

export default function LandingPage() {
    const [booking, setBooking] = useState({
        fullName: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        service: 0
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDOB, setSelectedDOB] = useState(new Date());
    const [services, setServices] = useState();
    const [open, setOpen] = useState(false);
    const [switchNav, setSwitchNav] = useState('HOME');
    const [isShow, setShow] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [doctorSelected, setDoctorSelected] = useState();
    const [shiftSelected, setShiftSelected] = useState();
    const [isDialogShow, setDialogShow] = useState(false);
    const [isDoctorShow, setDoctorShow] = useState(false);
    const [isShiftShow, setShiftShow] = useState(false);
    const [infoD, setInfoD] = useState();
    const [infoS, setInfoS] = useState();
    const history = useHistory();
    const [isLoginShow, setLoginShow] = useState(false);
    const [isRegisterShow, setRegisterShow] = useState(false);
    const [currentUser, setCurrentUser] = useState();
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const steps = ['information', 'payment'];
    const formRef = useRef();
    const [isInfoValid, setInfoValid] = useState(false);
    const [isProfileShow, setProfileShow] = useState(false);
    const [valueTab, setValueTab] = useState(0);
    const [isUpdating, setUpdating] = useState({
        fullName: false,
        gender: false,
        birthday: false,
        phone: false,
        email: false,
        address: false,
        username: false,
        password: false
    });
    const [isVaccineShow, setVaccineShow] = useState(false);
    const [isCovidTestShow, setCovidTestShow] = useState(false);
    const [isHealthRecordsShow, setHealthRecordsShow] = useState(false);
    const [prescriptionsWithVaccine, setPrescriptionsWithVaccine] = useState([]);
    const [prescriptionsWithCovidTest, setPrescriptionsWithCovidTest] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isPrescriptionDetailsShow, setPrescriptionDetailsShow] = useState(false);
    const [doctorOfPrescription, setDoctorOfPrescription] = useState();
    const [shiftOfPrescription, setShiftOfPrescription] = useState();
    const [isCovidTestDetailsShow, setCovidTestDetailsShow] = useState(false);
    const [prescriptionWithCovidTest, setPrescriptionWithCovidTest] = useState();

    const useStyles = makeStyles({
        header: {
            backgroundImage: `url(${imgUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPositionX: 'right',
            height: 750,
        },
        menu_container: {
            display: 'flex',
            justifyContent: 'flex-end',
            listStyleType: 'none',
            fontSize: 16,
            '& a': {
                color: 'black',
                textDecoration: 'none',
                display: 'block'
            },
            '& li': {
                padding: 5,
                minWidth: 100,
                borderRadius: 40,
                textAlign: 'center'
            }
        },
        btnGroup: {
            position: 'absolute',
            top: 320,
            left: 200,

        },
        btn: {
            margin: 15,
            '& button': {
                borderRadius: 30
            }
        },
        selected: {
            background: '#1976d2',
            '& a': {
                color: 'white'
            }
        },
        content: {
            marginTop: 100,
            padding: 50,
            '& h3, h6': {
                marginTop: 20
            }
        },
        nav: {
            position: 'fixed',
            top: 0,
            background: '#e3f2fd',
            width: '100%',
            zIndex: 10
        },
        avatar: {
            width: '100%',
            minHeight: 100,
            border: '2px solid black'
        },
        editIcon: {
            fill: isInfoValid ? 'green' : 'grey',
            fontSize: 36,
            cursor: isInfoValid ? 'pointer' : 'not-allowed'
        }
    })

    const classes = useStyles();

    const handleTabChange = (event, newValue) => {
        setValueTab(newValue);
    }

    const isStepOptional = (step) => {
        return step === 1;
    }

    const isStepSkipped = (step) => {
        return skipped.has(step);
    }

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    const columnsDoctor = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'account_id',
            hide: true
        },
        {
            field: 'image',
            headerName: ' ',
            renderCell: (params) => {
                const account_id = params.getValue(params.id, 'account_id');
                const account = accounts.filter(a => a.id === account_id);
                return (
                    <img src={account[0]?.image} width="100%" />
                )
            }
        },
        {
            field: 'firstName',
            hide: true
        },
        {
            field: 'lastName',
            hide: true
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            width: 200,
            valueGetter: (params) => {
                return `${params.getValue(params.id, 'lastName')} ${params.getValue(params.id, 'firstName')}`
            }
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 200
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200
        }
    ]

    const columnsShift = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200
        },
        {
            field: 'name',
            headerName: 'Shift name',
            width: 250
        },
        {
            field: 'description',
            headerName: 'Shift description',
            width: 500
        },
        {
            field: 'maxBookings',
            headerName: 'Max number of bookings',
            width: 300
        },
        {
            field: 'isMax',
            headerName: 'Is bookings max',
            width: 200
        }
    ]

    function getServices() {
        API.get(`${endpoints['services']}`)
            .then(res => {
                console.log(res);
                setServices(res.data.content)
            }).catch(err => console.log(err));
    }

    function handleChange(event) {
        let temp = { ...booking };
        temp[event.target.name] = event.target.value;
        setBooking(temp);
    }

    function handleClose() {
        setOpen(false);
    }

    function toggleShow() {
        if (window.pageYOffset > 300)
            setShow(true);
        else
            setShow(false);
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const handleChooseDoctor = async () => {
        if (!selectedDate) {
            swal('Please choose a date', '', 'warning');
            return;
        }

        setOpen(false);

        if (!shiftSelected) {
            const doctorIds = await API(`${endpoints['schedules']}`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any doctors available on this date', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.doctor_id))];
            })
                .catch(err => console.log(err.response));

            let promise = [];
            let doctorArr = [];
            let accountIds = [];
            for (let i = 0; i < doctorIds?.length; i++) {
                promise.push(
                    API.get(`${endpoints['doctors']}/${doctorIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => doctorArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promise).then(() => {
                setDoctors(doctorArr);
                accountIds = doctorArr.map(d => d.account_id);

                let promises = [];
                let accountArr = [];
                for (let i = 0; i < accountIds?.length; i++) {
                    promises.push(
                        API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        }).then(res => accountArr.push(res.data))
                            .catch(err => console.log(err.response))
                    )
                }
                Promise.all(promises).then(() => {
                    setAccounts(accountArr);
                    setDialogShow(true);
                    setDoctorShow(true);
                });
            });
        } else {
            const doctorIds = await API(`${endpoints['shifts']}/${shiftSelected.id}/schedules`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any doctors available on this date and this shift', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.doctor_id))];
            })
                .catch(err => console.log(err.response));

            let promise = [];
            let doctorArr = [];
            let accountIds = [];
            for (let i = 0; i < doctorIds?.length; i++) {
                promise.push(
                    API.get(`${endpoints['doctors']}/${doctorIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => doctorArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promise).then(() => {
                setDoctors(doctorArr);
                accountIds = doctorArr.map(d => d.account_id);

                let promises = [];
                let accountArr = [];
                for (let i = 0; i < accountIds?.length; i++) {
                    promises.push(
                        API.get(`${endpoints['accounts']}/${accountIds[i]}`, {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        }).then(res => accountArr.push(res.data))
                            .catch(err => console.log(err.response))
                    )
                }
                Promise.all(promises).then(() => {
                    setAccounts(accountArr);
                    setDialogShow(true);
                    setDoctorShow(true);
                });
            });
        }
    }

    const handleChooseShift = async () => {
        if (!selectedDate) {
            swal('Please choose a date', '', 'warning');
            return;
        }

        setOpen(false);

        if (!doctorSelected) {
            const shiftIds = await API(`${endpoints['schedules']}`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal('There are not any shifts available on this date', '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.shift_id))];
            })
                .catch(err => console.log(err.response));

            let promises = [];
            let shiftArr = [];
            let isMaxArr = [];
            for (let i = 0; i < shiftIds?.length; i++) {
                promises.push(
                    API.get(`${endpoints['shifts']}/${shiftIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => shiftArr.push(res.data))
                        .catch(err => console.log(err.response)),

                    API(`${endpoints['shifts']}/${shiftIds[i]}/bookings/date`, {
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        data: selectedDate
                    }).then(res => isMaxArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => {
                for (let i = 0; i < shiftArr.length; i++) {
                    Object.assign(shiftArr[i], { isMax: isMaxArr[i] })
                }
                setShifts(shiftArr);
                setDialogShow(true);
                setShiftShow(true);
            })
        } else {
            const shiftIds = await API(`${endpoints['doctors']}/${doctorSelected.id}/schedules`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: selectedDate
            }).then(res => {
                if (res.data.content.length == 0) {
                    swal(`There are not any shifts available on this date and doctor: 
                    ${doctorSelected.lastName + ' ' + doctorSelected.firstName}`, '', 'warning');
                }
                return [...new Set(res.data.content.map(sh => sh.shift_id))];
            })
                .catch(err => console.log(err.response));

            let promises = [];
            let shiftArr = [];
            let isMaxArr = [];
            for (let i = 0; i < shiftIds?.length; i++) {
                promises.push(
                    API.get(`${endpoints['shifts']}/${shiftIds[i]}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(res => shiftArr.push(res.data))
                        .catch(err => console.log(err.response)),

                    API(`${endpoints['shifts']}/${shiftIds[i]}/bookings/date`, {
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        data: selectedDate
                    }).then(res => isMaxArr.push(res.data))
                        .catch(err => console.log(err.response))
                )
            }
            Promise.all(promises).then(() => {
                for (let i = 0; i < shiftArr.length; i++) {
                    Object.assign(shiftArr[i], { isMax: isMaxArr[i] })
                }
                setShifts(shiftArr);
                setDialogShow(true);
                setShiftShow(true);
            });
        }
    }

    function handleSelectionChange(id) {
        if (isDoctorShow) {
            API.get(`${endpoints['doctors']}/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setDoctorSelected(res.data))
                .catch(err => console.log(err));
        } else if (isShiftShow) {
            API.get(`${endpoints['shifts']}/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => setShiftSelected(res.data))
                .catch(err => console.log(err))
        }
    }

    function handleSave() {
        if (isDoctorShow) {
            if (!doctorSelected) {
                swal('Please choose a doctor', '', 'warning');
                return;
            }
        } else if (isShiftShow) {
            if (!shiftSelected) {
                swal('Please choose a shift', '', 'warning');
                return;
            }
        }

        if (doctorSelected || shiftSelected) {
            if (doctorSelected) {
                setInfoD(`Doctor: ${doctorSelected.lastName} ${doctorSelected.firstName}`);
            }
            if (shiftSelected) {
                setInfoS(`Shift: ${shiftSelected.description}`);
            }
        }

        setDialogShow(false);
        setDoctorShow(false);
        setShiftShow(false);
        setOpen(true);
    }

    function handleCloseDialog() {
        if (isDoctorShow) {
            setDoctorSelected();
            setDoctorShow(false);
        } else if (isShiftShow) {
            setShiftSelected();
            setShiftShow(false);
        }

        setDialogShow(false);
        setOpen(true);
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!doctorSelected) {
            swal('Please choose a doctor', '', 'warning');
            return;
        }
        if (!shiftSelected) {
            swal('Please choose a shift', '', 'warning');
            return;
        }

        let param = "";
        if (currentUser)
            param = `?patientId=${currentUser.userId}`

        API(`${endpoints['doctors']}/${doctorSelected.id}/shifts/${shiftSelected.id}
            /services/${booking.service}/bookings${param}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                fullName: booking.fullName,
                gender: booking.gender,
                dateOfBirth: selectedDOB,
                phone: booking.phone,
                email: booking.email,
                address: booking.address
            }
        }).then(res => {
            if (res.status === 201) {
                swal('Success', '', 'success');
                setOpen(false);
                setActiveStep(0);

                //firebase here
                const database = getDatabase();
                const notiListRef = ref(database, 'notifications');
                const newNotiRef = push(notiListRef);
                const now = new Date();
                set(newNotiRef, {
                    content: 'There is a new booking.',
                    time: now.toString()
                });

                let array = [];
                onValue(notiListRef, (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        let childData = childSnapshot.val();
                        array.push({
                            content: childData.content,
                            time: childData.time
                        })
                    })
                })
                console.log(array)
            }
        })
            .catch(err => {
                if (Array.isArray(err.response?.data)) {
                    for (let i = 0; i < err.response.data.length; i++) {
                        swal(err.response.data[i].message, '', 'error');
                    }
                } else if (err.response?.status === 401) {
                    if (window.confirm('Login expired! Please login again.')) {
                        localStorage.clear();
                        history.push(url['login']);
                    }
                }
            })
    }

    function handleSubmitPaypal() {
        if (!doctorSelected) {
            swal('Please choose a doctor', '', 'warning');
            return;
        }
        if (!shiftSelected) {
            swal('Please choose a shift', '', 'warning');
            return;
        }

        let param = "";
        if (currentUser)
            param = `?patientId=${currentUser.userId}`

        API(`${endpoints['doctors']}/${doctorSelected.id}/shifts/${shiftSelected.id}
            /services/${booking.service}/bookings${param}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: {
                fullName: booking.fullName,
                gender: booking.gender,
                dateOfBirth: selectedDOB,
                phone: booking.phone,
                email: booking.email,
                address: booking.address,
                paid: true
            }
        }).then(res => {
            console.log(res);
            if (res.status === 201) {
                swal('Success', '', 'success');
                setOpen(false);
                setActiveStep(0);
            }
        })
            .catch(err => {
                if (Array.isArray(err.response?.data)) {
                    for (let i = 0; i < err.response.data.length; i++) {
                        swal(err.response.data[i].message, '', 'error');
                    }
                } else if (err.response?.status === 401) {
                    if (window.confirm('Login expired! Please login again.')) {
                        localStorage.clear();
                        history.push(url['login']);
                    }
                }
            })
    }

    function getCurrentUser() {
        API.get(`/auth/user`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            console.log(res);
            if (res.status === 200) {
                setCurrentUser(res.data);
                setBooking({
                    fullName: res.data.lastName + ' ' + res.data.firstName,
                    gender: res.data.gender,
                    phone: res.data.phone,
                    email: res.data.email,
                    address: res.data.address,
                    service: 0
                })
                setSelectedDOB(new Date(res.data.dob));
                setInfoValid(true);
            }
        }).catch(err => {
            console.log(err.response)
            if (err.response?.status === 403) {
                swal(`Your role was forbidden`, '', 'error');
                localStorage.clear();
                return;
            }
        })
    }

    useEffect(() => {
        setTimeout(() => setOpen(true), 500)

        window.addEventListener("scroll", toggleShow);

        ValidatorForm.addValidationRule('isPhoneNumber', (value) => {
            const regex = new RegExp("(84|0[3|5|7|8|9])+([0-9]{8})\\b");
            if (regex.test(value)) {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isServiceChosen', (value) => {
            return value !== 0;
        })
        ValidatorForm.addValidationRule('isEmail', (value) => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(value)) {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isGender', (value) => {
            if (value.toLowerCase() === 'male' || value.toLowerCase() === 'female') {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isBlank', (value) => {
            const re = /^\s*$/;
            if (re.test(value)) {
                setInfoValid(false);
                return false;
            }
            setInfoValid(true);
            return true;
        })
        ValidatorForm.addValidationRule('isValidUsername', (value) => {
            if (value.toString().length >= 8 && value.toString().length <= 12) {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isValidPassword', (value) => {
            const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$");
            if (regex.test(value)) {
                setInfoValid(true)
                return true;
            }
            setInfoValid(false);
            return false;
        })

        getServices();
        getCurrentUser();

        const firebaseConfig = {
            apiKey: "AIzaSyB4eNncvS4xXvEmLQCAfAXgmiJOJnekaQU",
            authDomain: "dhbhospital.firebaseapp.com",
            databaseURL: "https://dhbhospital-default-rtdb.firebaseio.com",
            projectId: "dhbhospital",
            storageBucket: "dhbhospital.appspot.com",
            messagingSenderId: "894178118006",
            appId: "1:894178118006:web:533448f7c6027028881257",
            measurementId: "G-SQ482RM39Q"
        };

        // Initialize Firebase
        if (!firebase.apps.length) {
            const app = initializeApp(firebaseConfig);
            console.log('Connected');
        }

        AOS.init({
            duration: 1000
        });
    }, [])

    useEffect(() => {
        getCurrentUser();
    }, [localStorage.getItem('token')])

    function handleLogout() {
        setBooking({
            fullName: '',
            gender: '',
            phone: '',
            email: '',
            address: '',
            service: 0
        });
        setCurrentUser();
        setInfoValid(false);
        localStorage.clear();
    }

    function vaccineConfirmation() {
        const serviceName = "Covid vaccination";
        API.get(`${endpoints['patients']}/${currentUser?.userId}/services/${serviceName}/prescriptions`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setPrescriptionsWithVaccine(res.data.content))
            .catch(err => console.log(err))

        setVaccineShow(true);
    }

    function covidTests() {
        const serviceName = "Covid test";
        API.get(`${endpoints['patients']}/${currentUser?.userId}/services/${serviceName}/prescriptions`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setPrescriptionsWithCovidTest(res.data.content))
            .catch(err => console.log(err))

        setCovidTestShow(true);
    }

    function getHealthRecords(page = "?p=1") {
        API.get(`${endpoints['patients']}/${currentUser?.userId}/prescriptions${page}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPrescriptions(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
            setCurrentPage(res.data.number);
            setHealthRecordsShow(true);
        })
            .catch(err => console.log(err))
    }

    function handlePageChange(event, newPage) {
        getHealthRecords(`?p=${newPage}`);
        setCurrentPage(newPage - 1);
    }

    async function getPrescriptionDetails(pres) {
        const doctor = await API.get(`${endpoints['doctors']}/${pres.doctor_id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => setDoctorOfPrescription(res.data))
            .catch(err => console.log(err.response))

        const medicineIds = await API.get(`${endpoints['prescriptions']}/${pres.id}/prescriptionDetails`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            setPrescriptionDetails(res.data.content);

            return res.data.content.map(p => p.medicine_id);
        })
            .catch(err => console.log(err.response))

        let promises = [];
        let medicineArr = [];
        for (let i = 0; i < medicineIds?.length; i++) {
            promises.push(
                API.get(`${endpoints['medicines']}/${medicineIds[i]}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(res => medicineArr.push(res.data))
                    .catch(err => console.log(err))
            )
        }
        Promise.all(promises).then(() => {
            setMedicines(medicineArr);
        });
    }

    function isRowSelectable(params) {
        return params.row.isMax !== true;
    }

    return (
        <CurrentUserContext.Provider
            value={{
                currentUser: currentUser,
                setCurrentUser: setCurrentUser,
                isLoginShow: isLoginShow,
                setLoginShow: setLoginShow,
                isRegisterShow: isRegisterShow,
                setRegisterShow: setRegisterShow
            }}>
            <div className={classes.root}>
                <div className={classes.header}>
                    <nav className={classes.nav}>
                        <div style={{ position: 'absolute', left: 50 }}>
                            <LocalHospitalIcon style={{ fontSize: 64, color: '#1976d2' }} />
                            <Typography variant="h6" noWrap style={{ position: 'absolute', top: 15, left: 70 }}>
                                DHB HOSPITAL
                            </Typography>
                        </div>
                        <ul className={classes.menu_container}>
                            <li className={switchNav === 'HOME' ? classes.selected : ''}>
                                <a onClick={() => setSwitchNav('HOME')} href="#">HOME</a>
                            </li>
                            <li className={switchNav === 'ABOUT' ? classes.selected : ''}>
                                <a onClick={() => setSwitchNav('ABOUT')} href="#about">ABOUT</a>
                            </li>
                            <li className={switchNav === 'SERVICE' ? classes.selected : ''}>
                                <a onClick={() => setSwitchNav('SERVICE')} href="#service">SERVICE</a>
                            </li>
                            <li className={switchNav === 'CONTACT' ? classes.selected : ''}>
                                <a onClick={() => setSwitchNav('CONTACT')} href="#">CONTACT</a>
                            </li>
                        </ul>
                    </nav>

                    {currentUser ? (
                        <div style={{ width: 150, position: 'absolute', top: 150, left: 200 }}>
                            <Avatar alt={currentUser.lastName + ' ' + currentUser.firstName}
                                src={currentUser.image} className={classes.avatar}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setProfileShow(true)} />
                            <Typography variant="h6" align="center">{currentUser.lastName + ' ' + currentUser.firstName}</Typography>
                        </div>
                    ) : ''}

                    <div className={classes.btnGroup}>
                        <div className={classes.btn}>
                            <Button style={{ minWidth: 120 }} variant="outlined" color="primary"
                                onClick={() => setRegisterShow(true)}>
                                Register
                            </Button>
                        </div>
                        <div className={classes.btn}>
                            <Button style={{ minWidth: 120 }} variant="outlined" color="secondary"
                                onClick={() => !currentUser ? setLoginShow(true) : handleLogout()}>
                                {currentUser ? 'Logout' : 'Login'}
                            </Button>
                        </div>
                        <div className={classes.btn}>
                            <Button style={{ minWidth: 120 }} variant="outlined" color="inherit"
                                onClick={() => setOpen(true)}>Booking</Button>
                        </div>
                    </div>

                    <Dialog
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Transition}>
                        <ValidatorForm ref={formRef} onSubmit={handleSubmit}>
                            <DialogTitle>
                                <Stepper activeStep={activeStep} alternativeLabel>
                                    {steps.map((label, index) => {
                                        const stepProps = {};
                                        const labelProps = {};
                                        if (isStepSkipped(index)) {
                                            stepProps.completed = false;
                                        }
                                        return (
                                            <Step key={label} {...stepProps}>
                                                <StepLabel {...labelProps}>{label}</StepLabel>
                                            </Step>
                                        );
                                    })}
                                </Stepper>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {activeStep === steps.length - 1 ? (
                                        <Grid style={{ paddingLeft: 20 }} container spacing={4}>
                                            <Grid item xs={12}>
                                                <Typography>Payment online</Typography>
                                                <Paypal
                                                    service={services?.filter(s => s.id === booking.service)[0]}
                                                    handleSubmit={handleSubmitPaypal} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>Payment later</Typography>
                                                <Button variant="contained" color="primary"
                                                    style={{ minWidth: 530 }}
                                                    type="submit"   >
                                                    FINISH
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Grid container item xs={12} spacing={4} style={{ textAlign: 'center' }}>
                                            <Grid item xs={6}>
                                                <TextValidator className={classes.input} name="fullName" label="Full name *"
                                                    validators={['required', 'isBlank']}
                                                    errorMessages={['this field is required', 'please enter characters']}
                                                    value={booking.fullName}
                                                    onChange={handleChange} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextValidator name="gender" label="Gender *"
                                                    validators={['required', 'isGender']}
                                                    errorMessages={['this field is required', 'invalid gender']}
                                                    value={booking.gender}
                                                    onChange={handleChange} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker style={{ width: 200 }}
                                                        label="DOB *" format="dd-MM-yyyy"
                                                        onChange={(date) => setSelectedDOB(date)}
                                                        name="dateOfBirth" value={selectedDOB} />
                                                </MuiPickersUtilsProvider>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextValidator name="phone" label="Phone *"
                                                    validators={['required', 'isPhoneNumber']}
                                                    errorMessages={['this field is required', 'invalid phone number']}
                                                    value={booking.phone}
                                                    onChange={handleChange} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextValidator name="email" label="Email *"
                                                    validators={['required', 'isEmail']}
                                                    errorMessages={['this field is required', 'invalid email']}
                                                    value={booking.email}
                                                    onChange={handleChange} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextValidator name="address" label="Address *"
                                                    validators={['required', 'isBlank']}
                                                    errorMessages={['this field is required', 'please enter characters']}
                                                    value={booking.address}
                                                    onChange={handleChange} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker style={{ width: 200 }}
                                                        label="Date *" format="dd-MM-yyyy"
                                                        minDate={new Date()}
                                                        onChange={(date) => {
                                                            setSelectedDate(date);
                                                            setDoctorSelected();
                                                            setShiftSelected();
                                                        }}
                                                        name="date" value={selectedDate} />
                                                </MuiPickersUtilsProvider>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Button
                                                    style={{ minWidth: 195, borderRadius: 25 }}
                                                    variant="contained" color="primary"
                                                    onClick={handleChooseDoctor}>Choose a doctor</Button>
                                                {
                                                    doctorSelected ? (
                                                        <Tooltip arrow title={infoD}>
                                                            <InfoIcon />
                                                        </Tooltip>
                                                    ) : ''
                                                }
                                                <Button
                                                    style={{ marginTop: 10, minWidth: 195, borderRadius: 25 }}
                                                    variant="contained" color="secondary"
                                                    onClick={handleChooseShift}>Choose a shift</Button>
                                                {
                                                    shiftSelected ? (
                                                        <Tooltip arrow title={infoS}>
                                                            <InfoIcon />
                                                        </Tooltip>
                                                    ) : ''
                                                }
                                            </Grid>
                                            <Grid item xs={6}>
                                                <SelectValidator
                                                    style={{ marginTop: -25, minWidth: 200, textAlign: 'initial' }}
                                                    validators={['isServiceChosen']}
                                                    errorMessages={['this field is required']} value={booking.service}
                                                    onChange={(event) => {
                                                        setBooking({ ...booking, service: event.target.value });
                                                    }}>
                                                    <MenuItem value={0}>Choose service</MenuItem>
                                                    {services && services.map(s => <MenuItem value={s.id}>{s.name}</MenuItem>)}
                                                </SelectValidator>
                                            </Grid>
                                        </Grid>
                                    )}
                                    <Button
                                        style={{ marginTop: 40, marginLeft: 20 }}
                                        variant="outlined" color="secondary"
                                        onClick={handleBack}
                                        disabled={activeStep === 0}>
                                        Go back
                                    </Button>
                                    <Button
                                        style={{ marginTop: 40, marginLeft: 10 }}
                                        variant="outlined" color="primary"
                                        disabled={activeStep === steps.length - 1 ||
                                            !Object.values(booking).every(i => i !== '') || !isInfoValid
                                            || booking.service === 0 || !doctorSelected || !shiftSelected}
                                        onClick={handleNext}>Next</Button>
                                </DialogContentText>
                            </DialogContent>
                        </ValidatorForm>
                    </Dialog>

                    <Dialog
                        style={{ zIndex: 1000 }}
                        fullScreen
                        open={isDialogShow}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">
                            <IconButton edge="start" color="inherit" onClick={handleCloseDialog} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            {isDoctorShow ? 'Choose a doctor' : 'Choose a shift'}
                            <IconButton style={{ position: 'absolute', right: 15 }} onClick={handleSave} aria-label="save">
                                <SaveAltIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                <Grid container spacing={4}>
                                    <Grid item xs={12} style={{ marginTop: 10 }}>
                                        {isDoctorShow ? (
                                            <DataTable rows={doctors} columns={columnsDoctor}
                                                btnTitle="" createURL="" header=""
                                                handleSelectionChange={handleSelectionChange} />
                                        ) : (isShiftShow ? (
                                            <DataTable rows={shifts} columns={columnsShift}
                                                btnTitle="" createURL="" header=""
                                                handleSelectionChange={handleSelectionChange}
                                                isRowSelectable={isRowSelectable} />
                                        ) : '')}
                                    </Grid>
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>

                    <Login isDialogShow={isLoginShow} handleClose={() => setLoginShow(false)} />

                    <Register isDialogShow={isRegisterShow} handleClose={() => setRegisterShow(false)} />

                </div>
                <div id="about" data-aos="flip-right" className={classes.content}>
                    <Grid container spacing={8}>
                        <Grid item xs={5}>
                            <Typography variant="h3">ABOUT</Typography>
                            <Typography variant="subtitle1">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                when an unknown printer took a galley of type and scrambled it to make a type
                                specimen book. It has survived not only five centuries, but also the leap into
                                electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
                                with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                                with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <img style={{ marginLeft: 110 }} src={process.env.PUBLIC_URL + '/images/gui4.svg'} width="100%" />
                        </Grid>
                    </Grid>
                </div>
                <div id="service" data-aos="flip-left" className={classes.content}>
                    <Grid container spacing={8}>
                        <Grid item xs={6}>
                            <img src={process.env.PUBLIC_URL + '/images/gui5.svg'} width="100%" />
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="h3">SERVICE</Typography>
                            <Typography variant="subtitle1">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                when an unknown printer took a galley of type and scrambled it to make a type
                                specimen book. It has survived not only five centuries, but also the leap into
                                electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
                                with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                                with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
                {currentUser ? <Chat uid={currentUser.userId} displayName={currentUser.firstName}
                email={currentUser.email} photoURL={currentUser.image} /> : ''}
                {isShow ? <ScrollToTop handleScrollToTop={scrollToTop} /> : ''}
                <Dialog
                    fullScreen
                    open={isProfileShow}>
                    <DialogTitle>
                        <IconButton edge="start" color="inherit"
                            onClick={() => setProfileShow(false)} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Grid container spacing={4}>
                                <Grid container spacing={4} item xs={4}>
                                    <Grid item xs={12}>
                                        <Avatar style={{ width: 150, height: 150, margin: '0 auto' }} src={currentUser?.image} />
                                        <Typography style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>
                                            {currentUser?.lastName + ' ' + currentUser?.firstName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Tabs
                                            style={{ marginLeft: 85 }}
                                            orientation="vertical"
                                            indicatorColor="primary"
                                            textColor="primary"
                                            value={valueTab}
                                            onChange={handleTabChange}>
                                            <Tab label="Profile" />
                                            <Tab label="Health records" />
                                        </Tabs>
                                    </Grid>
                                </Grid>
                                <Grid item xs={8}>
                                    {valueTab === 0 ? (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>Full name</TableCell>
                                                        <TableCell>
                                                            {isUpdating.fullName ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator name="fullName"
                                                                            validators={['isBlank']}
                                                                            errorMessages={['this field is required']}
                                                                            value={currentUser?.lastName + ' ' + currentUser?.firstName}
                                                                            onChange={(e) => {
                                                                                const fullName = e.target.value;
                                                                                const firstName = fullName.split(' ').slice(-1).join(' ');
                                                                                const lastName = fullName.split(' ').slice(0, -1).join(' ');
                                                                                setCurrentUser({ ...currentUser, lastName: lastName, firstName: firstName })
                                                                            }} />
                                                                        <EditAttributes id="fullName"
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                                    /patients/${currentUser?.userId}`, {
                                                                                        method: 'PATCH',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: {
                                                                                            firstName: currentUser?.firstName,
                                                                                            lastName: currentUser?.lastName
                                                                                        }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, fullName: false })
                                                                                        }
                                                                                    })
                                                                                        .catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            )
                                                                : (currentUser?.lastName + ' ' + currentUser?.firstName)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, fullName: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Gender</TableCell>
                                                        <TableCell>
                                                            {isUpdating.gender ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator
                                                                            value={currentUser?.gender}
                                                                            validators={['isGender']}
                                                                            errorMessages={['invalid gender']}
                                                                            onChange={(e) => {
                                                                                setCurrentUser({ ...currentUser, gender: e.target.value })
                                                                            }} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                                    /patients/${currentUser?.userId}`, {
                                                                                        method: 'PATCH',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { gender: currentUser?.gender }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, gender: false })
                                                                                        }
                                                                                    })
                                                                                        .catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.gender}
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, gender: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Birthday</TableCell>
                                                        <TableCell>
                                                            {isUpdating.birthday ? (
                                                                <>
                                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                                        <KeyboardDatePicker style={{ width: 200 }}
                                                                            format="dd/MM/yyyy"
                                                                            onChange={(date) => setCurrentUser({ ...currentUser, dob: date })}
                                                                            name="dateOfBirth" value={new Date(currentUser?.dob)} />
                                                                    </MuiPickersUtilsProvider>

                                                                    <EditAttributes
                                                                        style={{ fill: 'green', fontSize: 36, cursor: 'pointer' }}
                                                                        onClick={() => {
                                                                            API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                            /patients/${currentUser?.userId}`, {
                                                                                method: 'put',
                                                                                headers: {
                                                                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                },
                                                                                data: {
                                                                                    firstName: currentUser?.firstName,
                                                                                    lastName: currentUser?.lastName,
                                                                                    gender: currentUser?.gender,
                                                                                    phone: currentUser?.phone,
                                                                                    email: currentUser?.email,
                                                                                    address: currentUser?.address,
                                                                                    dateOfBirth: new Date(currentUser.dob)
                                                                                }
                                                                            }).then(res => console.log(res))
                                                                                .catch(err => console.log(err.response))
                                                                            setUpdating({ ...isUpdating, birthday: false })
                                                                        }} />
                                                                </>
                                                            ) : `${new Date(currentUser?.dob).getDate()}/${new Date(currentUser?.dob).getMonth() + 1}/${new Date(currentUser?.dob).getFullYear()}`}
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, birthday: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Phone</TableCell>
                                                        <TableCell>
                                                            {isUpdating.phone ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator value={currentUser?.phone}
                                                                            validators={['isPhoneNumber']}
                                                                            errorMessages={['invalid phone number']}
                                                                            onChange={(e) => {
                                                                                setCurrentUser({ ...currentUser, phone: e.target.value })
                                                                            }} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                            /patients/${currentUser?.userId}`, {
                                                                                        method: 'patch',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { phone: currentUser?.phone }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, phone: false })
                                                                                        }
                                                                                    })
                                                                                        .catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.phone}</TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, phone: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Email</TableCell>
                                                        <TableCell>
                                                            {isUpdating.email ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator
                                                                            value={currentUser?.email}
                                                                            validators={['isEmail']}
                                                                            errorMessages={['invalid email']}
                                                                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                                /patients/${currentUser?.userId}`, {
                                                                                        method: 'patch',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { email: currentUser?.email }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, email: false })
                                                                                        }
                                                                                    })
                                                                                        .catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.email}</TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, email: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Address</TableCell>
                                                        <TableCell>
                                                            {isUpdating.address ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator
                                                                            value={currentUser?.address}
                                                                            validators={['isBlank']}
                                                                            errorMessages={'this field is required'}
                                                                            onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}
                                                                                    /patients/${currentUser?.userId}`, {
                                                                                        method: 'patch',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { address: currentUser?.address }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, address: false })
                                                                                        }
                                                                                    }).catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.address}</TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setUpdating({ ...isUpdating, address: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Username</TableCell>
                                                        <TableCell>
                                                            {isUpdating.username ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator value={currentUser?.username}
                                                                            validators={['isValidUsername']}
                                                                            errorMessages={['invalid username']}
                                                                            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}`, {
                                                                                        method: 'patch',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { username: currentUser?.username }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, username: false })
                                                                                        }
                                                                                    }).catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.username}</TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, username: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Password</TableCell>
                                                        <TableCell>
                                                            {isUpdating.password ? (
                                                                <>
                                                                    <ValidatorForm>
                                                                        <TextValidator type="password"
                                                                            value={currentUser?.password}
                                                                            validators={['isValidPassword']}
                                                                            errorMessages={['invalid password']}
                                                                            onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} />
                                                                        <EditAttributes
                                                                            className={classes.editIcon}
                                                                            onClick={() => {
                                                                                if (isInfoValid) {
                                                                                    API(`${endpoints['accounts']}/${currentUser?.accountId}`, {
                                                                                        method: 'patch',
                                                                                        headers: {
                                                                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                                                                        },
                                                                                        data: { password: currentUser?.password }
                                                                                    }).then(res => {
                                                                                        if (res.status === 200) {
                                                                                            setUpdating({ ...isUpdating, password: false })
                                                                                        }
                                                                                    }).catch(err => console.log(err.response))
                                                                                }
                                                                            }} />
                                                                    </ValidatorForm>
                                                                </>
                                                            ) : currentUser?.password}</TableCell>
                                                        <TableCell>
                                                            <EditIcon
                                                                color="primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setUpdating({ ...isUpdating, password: true });
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (valueTab === 1 ? (
                                        <Grid container spacing={8}>
                                            <Grid item xs={12} container>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <FavoriteIcon color="primary"
                                                        style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={() => getHealthRecords()} />
                                                    <Typography color="textPrimary">Health records</Typography>
                                                </Grid>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <HealingIcon
                                                        style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                                        color="primary" onClick={vaccineConfirmation} />
                                                    <Typography color="textPrimary">Vaccination confirmation</Typography>
                                                </Grid>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <LocalHospitalIcon color="primary"
                                                        style={{ fontSize: 108, textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={covidTests} />
                                                    <Typography color="textPrimary">Covid tests</Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid style={{ marginTop: 50 }} item xs={12} container>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <AssignmentIcon color="primary" style={{ fontSize: 108, textAlign: 'center' }} />
                                                    <Typography>Health declaration</Typography>
                                                </Grid>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <HearingIcon color="primary" style={{ fontSize: 108, textAlign: 'center' }} />
                                                    <Typography>Symptoms after vaccination</Typography>
                                                </Grid>
                                                <Grid style={{ textAlign: 'center' }} item xs={4}>
                                                    <FeedbackIcon color="primary" style={{ fontSize: 108, textAlign: 'center' }} />
                                                    <Typography>Feedback</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ) : '')}
                                </Grid>
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isVaccineShow}
                    onClose={() => setVaccineShow(false)}
                    PaperProps={{
                        style: {
                            background: prescriptionsWithVaccine?.length === 2 ?
                                '##66bb6a' : (prescriptionsWithVaccine?.length === 1 ? '#fdd835'
                                    : '#e53935')
                        }
                    }}
                >
                    <DialogTitle>
                        <Typography style={{ textAlign: 'center' }}
                            color="textPrimary" variant="h5">Covid vaccination confirmation</Typography>
                        <VerifiedUserIcon
                            style={{
                                textAlign: 'center', display: 'block',
                                width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: 'white'
                            }} />
                        <hr style={{ border: '3px solid black' }} />
                        <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                            {prescriptionsWithVaccine?.length === 2 ? '2 shots of covid vaccine'
                                : (prescriptionsWithVaccine?.length === 1 ? '1 shot of covid vaccine' : '0 shot of covid vaccine')}
                        </Typography>
                        <hr style={{ border: '3px solid black' }} />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Grid container spacing={4}>
                                <Grid style={{ textAlign: 'center' }} item xs={12}>
                                    <QRCode
                                        id="qrcode"
                                        value={`http://localhost`}
                                        size={100}
                                        level={'H'}
                                        includeMargin
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="caption"
                                        style={{ fontSize: 16, fontWeight: 'bold' }}>Personal information</Typography>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell><PersonIcon /></TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">Full name</Typography>
                                                        <Typography>{currentUser?.lastName + ' ' + currentUser?.firstName}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><TodayIcon /></TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">Date of Birth</Typography>
                                                        <Typography>
                                                            {`${new Date(currentUser?.dob).getDate()}/${new Date(currentUser?.dob).getMonth() + 1}/${new Date(currentUser?.dob).getFullYear()}`}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><FingerprintIcon /></TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">Phone</Typography>
                                                        <Typography>{currentUser?.phone}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isCovidTestShow}
                    onClose={() => setCovidTestShow(false)}
                >
                    <DialogTitle>
                        <Typography style={{ textAlign: 'center' }}
                            color="textPrimary" variant="h5">Covid tests</Typography>
                        <VerifiedUserIcon
                            style={{
                                textAlign: 'center', display: 'block',
                                width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: '#f06292'
                            }} />
                        <hr style={{ border: '3px solid black' }} />
                        <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                            list of test samples
                        </Typography>
                        <hr style={{ border: '3px solid black' }} />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Grid container spacing={4}>
                                {prescriptionsWithCovidTest && prescriptionsWithCovidTest.map(p => {
                                    return (
                                        <Grid
                                            style={{ textAlign: 'center', cursor: 'pointer' }}
                                            item xs={4}
                                            onClick={() => {
                                                setPrescriptionWithCovidTest(p);
                                                setTimeout(() => {
                                                    setCovidTestDetailsShow(true);
                                                }, 300)
                                            }}>
                                            <div
                                                style={{
                                                    background: '#f06292',
                                                    minWidth: 150, textAlign: 'center', color: 'white',
                                                    textTransform: 'uppercase', paddingTop: 15, paddingBottom: 5,
                                                }}>
                                                {monthNames[new Date(p.date).getMonth()]}
                                            </div>
                                            <div
                                                style={{
                                                    background: '#e8eaf6', minWidth: 150, textAlign: 'center',
                                                    fontSize: 56, fontWeight: 'bold'
                                                }}>
                                                {('0' + new Date(p.date).getDate()).slice(-2)}
                                            </div>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isHealthRecordsShow}
                    onClose={() => setHealthRecordsShow(false)}
                >
                    <DialogTitle>
                        <Typography style={{ textAlign: 'center' }}
                            color="textPrimary" variant="h5">Health records</Typography>
                        <FavoriteIcon
                            style={{
                                textAlign: 'center', display: 'block',
                                width: '100%', fontSize: 82, marginTop: 20, marginBottom: 10, fill: '#f06292'
                            }} />
                        <hr style={{ border: '3px solid black' }} />
                        <Typography style={{ textAlign: 'center', textTransform: "uppercase" }} variant="h5">
                            List of prescriptions
                        </Typography>
                        <hr style={{ border: '3px solid black' }} />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Grid container spacing={4}>
                                {prescriptions && prescriptions.map(p => {
                                    return (
                                        <Grid
                                            style={{ textAlign: 'center', cursor: 'pointer' }}
                                            item xs={4}
                                            onClick={() => {
                                                getPrescriptionDetails(p);
                                                setTimeout(() => {
                                                    setPrescriptionDetailsShow(true);
                                                }, 300)
                                            }}>
                                            <div
                                                style={{
                                                    background: '#f06292',
                                                    minWidth: 150, textAlign: 'center', color: 'white',
                                                    textTransform: 'uppercase', paddingTop: 15, paddingBottom: 5,
                                                }}>
                                                {monthNames[new Date(p.date).getMonth()]}
                                            </div>
                                            <div
                                                style={{
                                                    background: '#e8eaf6', minWidth: 150, textAlign: 'center',
                                                    fontSize: 56, fontWeight: 'bold'
                                                }}>
                                                {('0' + new Date(p.date).getDate()).slice(-2)}
                                            </div>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions style={{ marginTop: 40 }}>
                        <Pagination page={currentPage + 1} count={totalPages} shape="rounded" variant="outlined"
                            showFirstButton showLastButton
                            onChange={handlePageChange} />
                    </DialogActions>
                </Dialog>

                <Dialog
                    fullScreen
                    open={isPrescriptionDetailsShow}
                >
                    <DialogTitle>
                        <IconButton edge="start" color="inherit"
                            onClick={() => setPrescriptionDetailsShow(false)} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <div style={{ textAlign: 'right', marginTop: -40 }}>
                            <LocalHospitalIcon style={{ fontSize: 64, color: '#1976d2' }} />
                            <Typography variant="h6" noWrap>
                                DHB HOSPITAL
                            </Typography>
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {prescriptionDetails ? (
                                <>
                                    <Typography style={{ margin: '40px 0 20px 0' }}>Prescription</Typography>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Patient name</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Service name</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Service fee</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Doctor</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {prescriptionDetails?.map(pd => {
                                                    const prescription = prescriptions.filter(p => p.id === pd.prescription_id)[0];
                                                    return (
                                                        <TableRow>
                                                            <TableCell>{currentUser?.lastName + ' ' + currentUser?.firstName}</TableCell>
                                                            <TableCell>{prescription?.serviceName}</TableCell>
                                                            <TableCell>{prescription?.serviceFee} $</TableCell>
                                                            <TableCell>
                                                                {`${new Date(prescription?.date).getDate()}/${new Date(prescription?.date).getMonth() + 1}/${new Date(prescription?.date).getFullYear()}`}
                                                            </TableCell>
                                                            <TableCell>{doctorOfPrescription?.lastName + ' ' + doctorOfPrescription?.firstName}</TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Typography style={{ margin: '40px 0 20px 0' }}>Prescription Details</Typography>
                                    <TableContainer component={Paper}>
                                        <Table arial-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell style={{ fontWeight: 'bold' }}>No.</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Medicine</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Description</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Price</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Unit</TableCell>
                                                    <TableCell style={{ fontWeight: 'bold' }}>Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {prescriptionDetails.map((p, index) => {
                                                    const medicine = medicines.filter(m => m.id === p.medicine_id)[0];
                                                    return (
                                                        <TableRow key={p.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{medicine?.name}</TableCell>
                                                            <TableCell>{medicine?.description}</TableCell>
                                                            <TableCell>{p.quantity}</TableCell>
                                                            <TableCell>{p.unitPrice}</TableCell>
                                                            <TableCell>{medicine?.unit}</TableCell>
                                                            <TableCell>{p.totalPrice}</TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                                <TableRow>
                                                    <TableCell colSpan={6}>Total price of medicine</TableCell>
                                                    <TableCell>
                                                        {prescriptionDetails.map(p => p.totalPrice).reduce((a, b) => a + b, 0)} $
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            ) : ''}
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

                <Dialog
                    fullScreen
                    open={isCovidTestDetailsShow}
                >
                    <DialogTitle>
                        <IconButton edge="start" color="inherit"
                            onClick={() => setCovidTestDetailsShow(false)} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <div style={{ textAlign: 'right', marginTop: -40 }}>
                            <LocalHospitalIcon style={{ fontSize: 64, color: '#1976d2' }} />
                            <Typography variant="h6" noWrap>
                                DHB HOSPITAL
                            </Typography>
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ fontWeight: 'bold' }}>Service name</TableCell>
                                            <TableCell style={{ fontWeight: 'bold' }}>Service fee</TableCell>
                                            <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell style={{ fontWeight: 'bold' }}>Description</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {prescriptionWithCovidTest ? (
                                            <TableRow>
                                                <TableCell>{prescriptionWithCovidTest.serviceName}</TableCell>
                                                <TableCell>{prescriptionWithCovidTest.serviceFee} $</TableCell>
                                                <TableCell>
                                                    {`${new Date(prescriptionWithCovidTest.date).getDate()}/${new Date(prescriptionWithCovidTest.date).getMonth() + 1}/${new Date(prescriptionWithCovidTest.date).getFullYear()}`}
                                                </TableCell>
                                                <TableCell>{prescriptionWithCovidTest.description}</TableCell>
                                            </TableRow>
                                        ) : ''
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            </div>
        </CurrentUserContext.Provider>
    )
}