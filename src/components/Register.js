import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, makeStyles, Slide, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import YouTubeIcon from '@material-ui/icons/YouTube';
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import swal from "sweetalert";
import { CurrentUserContext } from "../pages";
import API, { endpoints } from "../API";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    form: {
        textAlign: 'center'
    },
    btn: {
        minWidth: 50,
        marginRight: 5
    },
    button: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    actions: {
        marginTop: 30
    }
}))

export default function Register(props) {
    const isDialogShow = props.isDialogShow;
    const handleClose = props.handleClose;
    const classes = useStyles();
    const [account, setAccount] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fileImg: null
    })
    const [info, setInfo] = useState({
        fullName: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
    })
    const [image, setImage] = useState();
    const [selectedDOB, setSelectedDOB] = useState(new Date());
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const steps = ['username & password', 'information', 'completed'];
    const [isFormValid, setFormValid] = useState(false);
    const [isInfoValid, setInfoValid] = useState(false);
    const currentUserContext = useContext(CurrentUserContext);

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

        setActiveStep((prevActiveStep) => {
            const step = prevActiveStep + 1;

            if (step === 2) {
                let myForm = new FormData();
                myForm.append('username', account.username);
                myForm.append('password', account.password);
                if (account.fileImg)
                    myForm.append('file', account.fileImg);

                API(`${endpoints['roles']}/1/accounts`, {
                    method: 'post',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-type': 'multipart/form-data'
                    },
                    data: myForm
                }).then(res => {
                    if (res.status === 201) {
                        const accountId = res.data.id;
                        let fullName = info.fullName;
                        let lastName = fullName.split(' ').slice(0, -1).join(' ');
                        let firstName = fullName.split(' ').slice(-1).join(' ');
                        const data = {
                            firstName: firstName,
                            lastName: lastName,
                            gender: info.gender,
                            dateOfBirth: selectedDOB,
                            email: info.email,
                            phone: info.phone,
                            address: info.address
                        };
                        API(`${endpoints['accounts']}/${accountId}/patients`, {
                            method: 'post',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            data: data
                        }).then(res => console.log(res))
                            .catch(err => console.log(err))
                    }
                }).catch(err => console.log(err.response))
            }

            return step;
        });
        setSkipped(newSkipped);
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        })

        let myForm = new FormData();
        myForm.append('username', account.username);
        myForm.append('password', account.password);
        if (account.fileImg)
            myForm.append('file', account.fileImg);
        API(`${endpoints['roles']}/1/accounts`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-type': 'multipart/form-data'
            },
            data: myForm
        }).then(res => console.log(res))
            .catch(err => console.log(err))
    }

    function handleChange(event) {
        let temp = { ...info };
        temp[event.target.name] = event.target.value;
        setInfo(temp);
    }

    function handleChangeAccount(event) {
        let temp = { ...account };
        temp[event.target.name] = event.target.value;
        setAccount(temp);
    }

    function handleSubmit() { }

    function handleRegister() {
        currentUserContext.setRegisterShow(false);
        setActiveStep(0);
        setAccount({});
        setInfo({});
        setFormValid(false);
        setInfoValid(false);
    }

    function handleFileChange(event) {
        let png = event.target.value.toLowerCase().endsWith('.png');
        let jpg = event.target.value.toLowerCase().endsWith('.jpg');
        let jpeg = event.target.value.toLowerCase().endsWith('.jpeg');
        let svg = event.target.value.toLowerCase().endsWith('.svg');
        if (png || jpg || jpeg || svg) {
            const file = document.getElementById('upload-photo').files[0];
            if (file) {
                const src = URL.createObjectURL(file);
                let img = document.getElementById("avatar");
                setImage(src);
                setAccount({ ...account, fileImg: file })
            }

        }
        else {
            swal('Pls choose a file with valid extension', '', 'warning');
            event.target.value = '';
        }
    }

    function handleUploadImage() {

    }

    useEffect(() => {
        ValidatorForm.addValidationRule('isValidPassword', (value) => {
            const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$");
            if (regex.test(value)) {
                setFormValid(true)
                return true;
            }
            setFormValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
            if (value.toString() === document.getElementsByName('password')[1].value) {
                setFormValid(true);
                return true;
            }
            setFormValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('isValidUsername', (value) => {
            if (value.toString().length >= 8 && value.toString().length <= 12) {
                setFormValid(true);
                return true;
            }
            setFormValid(false);
            return false;
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
        ValidatorForm.addValidationRule('isPhoneNumber', (value) => {
            const regex = new RegExp("(84|0[3|5|7|8|9])+([0-9]{8})\\b");
            if (regex.test(value)) {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })
        ValidatorForm.addValidationRule('require', (value) => {
            const regex = /^(?!\s*$).+/;
            if (regex.test(value)) {
                setInfoValid(true);
                return true;
            }
            setInfoValid(false);
            return false;
        })

        return () => {
            ValidatorForm.removeValidationRule('isValidPassword');
            ValidatorForm.removeValidationRule('isPasswordMatch');
            ValidatorForm.removeValidationRule('isValidUsername');
            ValidatorForm.removeValidationRule('isEmail');
            ValidatorForm.removeValidationRule('isPhoneNumber');
            ValidatorForm.removeValidationRule('require');
        }
    }, [])

    console.log(Object.values(info).every(i => i !== ''));

    return (
        <Dialog
            style={{ zIndex: 1000 }}
            open={isDialogShow}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <ValidatorForm onSubmit={handleSubmit} className={classes.form}>
                <DialogTitle id="alert-dialog-slide-title">
                    REGISTER

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
                    <DialogContentText id="alert-dialog-slide-description">
                        <Grid style={{ width: 580 }} container spacing={4}>
                            {activeStep === 0 ? (
                                <>
                                    <Grid item xs={5}>
                                        <img src={image || process.env.PUBLIC_URL + '/images/gui6.svg'}
                                            width="80%" height={140} id="avatar"
                                            style={{ border: '2px solid black', marginTop: 25 }} />
                                        <label>
                                            <input id="upload-photo" type="file"
                                                name="avatar" style={{ display: 'none' }}
                                                onChange={handleFileChange} />
                                            <PhotoCameraIcon color="primary"
                                                style={{
                                                    position: 'absolute', top: 320, left: 30, cursor: 'pointer',
                                                    background: 'white', border: '2px solid black',
                                                    borderRadius: 30, padding: 5
                                                }}
                                                onClick={handleUploadImage} />
                                        </label>
                                    </Grid>
                                    <Grid item xs={7} container>
                                        <Grid item xs={12} style={{ marginTop: 5 }}>
                                            <TextValidator name="username" label="Username *"
                                                validators={['required', 'isValidUsername']}
                                                errorMessages={['this field is required', 'invalid username']}
                                                value={account.username} onChange={handleChangeAccount} />
                                        </Grid>
                                        <Grid item xs={12} style={{ marginTop: 5 }}>
                                            <TextValidator name="password" label="Password *"
                                                validators={['required', 'isValidPassword']} type="password"
                                                errorMessages={['this field is required', 'invalid password']}
                                                value={account.password} onChange={handleChangeAccount} />
                                        </Grid>
                                        <Grid item xs={12} style={{ marginTop: 5 }}>
                                            <TextValidator name="confirmPassword" label="Confirm Password *"
                                                validators={['required', 'isPasswordMatch']}
                                                type="password"
                                                errorMessages={['this field is required', 'password not match']}
                                                value={account.confirmPassword} onChange={handleChangeAccount} />
                                        </Grid>
                                    </Grid>
                                </>
                            ) : (activeStep === 1 ? (
                                <>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <TextValidator name="fullName" label="Full name *"
                                            validators={['require']}
                                            errorMessages={['this field is required']}
                                            value={info.fullName} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <TextValidator name="gender" label="Gender *"
                                            validators={['required']}
                                            errorMessages={['this field is required']}
                                            value={info.gender} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker style={{ width: 200 }}
                                                label="Birthday *" format="dd-MM-yyyy"
                                                onChange={(date) => setSelectedDOB(date)}
                                                name="dateOfBirth" value={selectedDOB} />
                                        </MuiPickersUtilsProvider>
                                    </Grid>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <TextValidator name="phone" label="Phone *"
                                            validators={['required', 'isPhoneNumber']}
                                            errorMessages={['this field is required', 'invalid phone number']}
                                            value={info.phone} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <TextValidator name="email" label="Email *"
                                            validators={['required', 'isEmail']}
                                            errorMessages={['this field is required', 'invalid email']}
                                            value={info.email} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={6} style={{ marginTop: 5 }}>
                                        <TextValidator name="address" label="Address *"
                                            validators={['required']}
                                            errorMessages={['this field is required']}
                                            value={info.address} onChange={handleChange} />
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={6}>
                                        <img src={process.env.PUBLIC_URL + '/images/gui7.svg'} width="100%" />
                                    </Grid>
                                </>
                            ))}
                            {/*<Grid item xs={6} style={{ marginTop: 5 }}>
                                <TextValidator name="username" label="Username *"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                    value={info.username} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={6} style={{ marginTop: 5 }}>
                                <TextValidator name="password" label="Password *"
                                    validators={['required']} type="password"
                                    errorMessages={['this field is required']}
                                    value={info.password} onChange={handleChange} />
                            </Grid> */}
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {activeStep === steps.length - 1 ? (
                        <div className={classes.actions}>
                            <Button onClick={handleRegister}>OK</Button>
                        </div>
                    ) : (
                        <div className={classes.actions}>
                            <Button disabled={activeStep === 0} onClick={handleBack}>Go back</Button>

                            {isStepOptional(activeStep) && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSkip}
                                    className={classes.button}
                                >
                                    Skip
                                </Button>
                            )}

                            {activeStep === steps.length - 2 ? (
                                <Button disabled={!Object.values(info).every(i => i !== '') || !isInfoValid}
                                    variant="contained" color="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (activeStep === steps.length - 3 ? (
                                <Button disabled={account.username === '' || account.password === ''
                                    || account.confirmPassword === '' || !isFormValid}
                                    variant="contained" color="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <>
                                </>
                            ))}
                        </div>
                    )}
                </DialogActions>
            </ValidatorForm >
        </Dialog >
    )
}