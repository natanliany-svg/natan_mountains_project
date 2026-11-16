import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { axiosClient, getApiErrorMessage } from '../api/axiosClient';

// (#16)
export function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // (#16)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await axiosClient.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה בהרשמה למערכת'));
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          הרשמת מטייל חדש
        </Typography>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        <Box component="form" onSubmit={handleRegisterSubmit}>
          <TextField
            fullWidth
            label="שם פרטי"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <TextField
            fullWidth
            label="שם משפחה"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <TextField
            fullWidth
            label="כתובת אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <TextField
            fullWidth
            label="סיסמה (לפחות 6 תווים)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            הירשם למערכת
          </Button>
          <Button
            fullWidth
            component={RouterLink}
            to="/login"
            sx={{ mt: 1 }}
            size="small"
          >
            כבר רשום? מעבר להתחברות
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
