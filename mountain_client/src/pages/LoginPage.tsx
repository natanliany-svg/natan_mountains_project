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
import { useAuth } from '../context/AuthContext';

// (#28)
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // (#28)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      login(response.data.access_token);
      navigate('/');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'אימייל או סיסמה שגויים'));
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          התחברות למערכת
        </Typography>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        <Box component="form" onSubmit={handleLoginSubmit}>
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
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            התחבר
          </Button>
          <Button
            fullWidth
            component={RouterLink}
            to="/register"
            sx={{ mt: 1 }}
            size="small"
          >
            אין לך חשבון? הירשם כאן
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
