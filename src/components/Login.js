import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, makeStyles, Slide,
    Typography } from "@material-ui/core";
import React, { useState, useContext } from "react";
import { Grid } from "@material-ui/core";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { mergeClasses } from "@material-ui/styles";
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import YouTubeIcon from '@material-ui/icons/YouTube';
import API from "../API";
import { CurrentUserContext } from "../pages";
import swal from "sweetalert";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
    form: {
        textAlign: 'center'
    },
    btn: {
        minWidth: 195,
        borderRadius: 30
    }
})

export default function Login(props) {
    const isDialogShow = props.isDialogShow;
    const handleClose = props.handleClose;
    const [user, setUser] = useState({
        username: '',
        password: ''
    });
    const classes = useStyles();
    const currentUserContext = useContext(CurrentUserContext);

    const handleSubmit = (event) => {
        event.preventDefault();

        let promises = [];
        promises.push(
            API(`/auth/signIn`, {
                method: 'post',
                data: user
            }).then(res => {
                if (res.status === 200) {
                    localStorage.setItem('token', res.data.accessToken);
                }
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    swal('Invalid username or password', '', 'error');
                    return ;
                }
            })
        )

        Promise.all(promises).then(() => {
            API.get(`/auth/user`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }).then(res => {
                console.log(res);
                if (res.status === 200) {
                    currentUserContext.setCurrentUser(res.data);
                    currentUserContext.setLoginShow(false);
                }
            }).catch(err => {
                console.log(err.response)
                if (err.response?.status === 403) {
                    swal(`Your role was forbidden`, '', 'error');
                    localStorage.clear();
                    return;
                }
            })
        })
    }

    const handleChange = (event) => {
        let temp = {...user};
        temp[event.target.name] = event.target.value;
        setUser(temp);
    }

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
                    LOGIN
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <Grid container spacing={4}>
                            <Grid item xs={12} style={{ marginTop: 5 }}>
                                <TextValidator name="username" label="Username *"
                                validators={['required']}
                                errorMessages={['this field is required']}
                                value={user.username} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: 5 }}>
                                <TextValidator name="password" label="Password *"
                                validators={['required']} type="password"
                                errorMessages={['this field is required']}
                                value={user.password} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} style={{ paddingTop: 0, marginLeft: 95 }}>
                                <a href="#" style={{color: 'blue', textDecoration: 'none'}}>
                                    <Typography variant="caption">Forgot password</Typography>
                                    </a>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: 5 }}>
                                <Button color="primary" variant="contained" className={classes.btn} type="submit">Login</Button>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: 20 }}>
                                Or    
                            </Grid>
                            <Grid item xs={12} style={{marginTop: 10}}>
                                <Button color="primary" startIcon={<FacebookIcon />} variant="outlined"
                                className={classes.btn}>
                                    Facebook
                                </Button>
                            </Grid>
                            <Grid item xs={12} style={{marginTop: -20}}>
                                <Button color="secondary" startIcon={<TwitterIcon />} variant="outlined"
                                className={classes.btn}>
                                    Twitter
                                </Button>
                            </Grid>
                            <Grid item xs={12} style={{marginTop: -20}}>
                                <Button startIcon={<YouTubeIcon />} variant="outlined"
                                className={classes.btn}>
                                    Youtube
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
            </ValidatorForm>
        </Dialog>
    )
}