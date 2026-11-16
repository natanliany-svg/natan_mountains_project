import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// (#29)
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // (#29)
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
          >
            MountainTracker
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
              <Typography variant="body2">
                שלום, {user.email} ({user.role === 'admin' ? 'מנהל' : 'מטייל'})
              </Typography>
              <Button color="inherit" variant="outlined" size="small" onClick={handleLogout}>
                התנתקות
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                התחברות
              </Button>
              <Button color="inherit" variant="outlined" size="small" component={RouterLink} to="/register">
                הרשמה
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
