import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { axiosClient, getApiErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import type { Mountain } from '../types';
import { MountainCard } from '../components/MountainCard';

// (#40)
export function MountainsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [location, setLocation] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('3');
  const [description, setDescription] = useState('');

  // (#40)
  const fetchMountains = useCallback(async (query?: string) => {
    try {
      setErrorMsg('');
      const endpoint = query?.trim()
        ? `/mountains/search?q=${encodeURIComponent(query.trim())}`
        : '/mountains';
      const response = await axiosClient.get<Mountain[]>(endpoint);
      setMountains(response.data);
    } catch {
      setErrorMsg('שגיאה בטעינת רשימת ההרים מהשרת');
    }
  }, []);

  // (#40)
  useEffect(() => {
    fetchMountains();
  }, [fetchMountains]);

  // (#40)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMountains(searchTerm);
  };

  // (#40)
  const handleCreateMountain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/mountains', {
        name,
        height: Number(height),
        location,
        difficultyLevel: Number(difficultyLevel),
        description: description || undefined,
      });
      setName('');
      setHeight('');
      setLocation('');
      setDifficultyLevel('3');
      setDescription('');
      fetchMountains(searchTerm);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה ביצירת ההר'));
    }
  };

  // (#40)
  const handleDeleteMountain = useCallback(
    async (id: number) => {
      try {
        await axiosClient.delete(`/mountains/${id}`);
        fetchMountains(searchTerm);
      } catch (err) {
        setErrorMsg(getApiErrorMessage(err, 'שגיאה במחיקת ההר'));
      }
    },
    [fetchMountains, searchTerm],
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        מאגר הרים ומסלולי טיול
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
        >
          <TextField
            fullWidth
            size="small"
            label="חיפוש הר לפי שם או מיקום..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="contained">
            חפש
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              fetchMountains('');
            }}
          >
            נקה
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          נמצאו {mountains.length} הרים
        </Typography>
      </Paper>

      {isAdmin && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, bgcolor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            הוספת הר חדש (למנהלים בלבד)
          </Typography>
          <Box
            component="form"
            onSubmit={handleCreateMountain}
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}
          >
            <TextField
              size="small"
              label="שם ההר"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              size="small"
              label="גובה (מטרים)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
            <TextField
              size="small"
              label="מיקום גיאוגרפי"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <TextField
              size="small"
              label="רמת קושי (1-5)"
              type="number"
              inputProps={{ min: 1, max: 5 }}
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              required
            />
            <TextField
              size="small"
              fullWidth
              label="תיאור קצר"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" variant="contained" color="secondary">
              שמור הר חדש
            </Button>
          </Box>
        </Paper>
      )}

      <Grid container spacing={2}>
        {mountains.map((mountain) => (
          <Grid item xs={12} sm={6} key={mountain.id}>
            <MountainCard
              mountain={mountain}
              isAdmin={isAdmin}
              onDelete={handleDeleteMountain}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
