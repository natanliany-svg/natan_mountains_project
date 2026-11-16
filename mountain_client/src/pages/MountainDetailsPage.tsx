import { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CardMedia,
  Paper,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { axiosClient, getApiErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import type { Mountain, Review, Trail } from '../types';

// (#47)
export function MountainDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [mountain, setMountain] = useState<Mountain | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [trailName, setTrailName] = useState('');
  const [lengthKm, setLengthKm] = useState('');
  const [difficulty, setDifficulty] = useState('קל');
  const [isCircular, setIsCircular] = useState(false);
  const [showAddTrail, setShowAddTrail] = useState(false);

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  // (#47)
  const fetchMountainData = useCallback(async () => {
    if (!id) return;
    try {
      setErrorMsg('');
      const [mountainRes, reviewsRes] = await Promise.all([
        axiosClient.get<Mountain>(`/mountains/${id}`),
        axiosClient.get<Review[]>(`/mountains/${id}/reviews`),
      ]);
      setMountain(mountainRes.data);
      setReviews(reviewsRes.data);

      if (user) {
        const trailsRes = await axiosClient.get<Trail[]>(`/mountains/${id}/trails`);
        setTrails(trailsRes.data);
      } else {
        setTrails([]);
      }
    } catch {
      setErrorMsg('שגיאה בטעינת נתוני ההר');
    }
  }, [id, user]);

  // (#47)
  useEffect(() => {
    fetchMountainData();
  }, [fetchMountainData]);

  // (#47)
  const handleAddTrail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setErrorMsg('');
      await axiosClient.post('/trails', {
        name: trailName,
        lengthKm: Number(lengthKm),
        difficulty,
        isCircular,
        mountainId: Number(id),
      });
      setTrailName('');
      setLengthKm('');
      setDifficulty('קל');
      setIsCircular(false);
      setShowAddTrail(false);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה בהוספת מסלול'));
    }
  };

  // (#47)
  const handleDeleteTrail = async (trailId: number) => {
    try {
      await axiosClient.delete(`/trails/${trailId}`);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה במחיקת מסלול'));
    }
  };

  // (#54)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setErrorMsg('');
      await axiosClient.post('/reviews', {
        mountainId: Number(id),
        rating: Number(rating),
        comment,
      });
      setComment('');
      setRating('5');
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה בהוספת ביקורת'));
    }
  };

  // (#54)
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await axiosClient.delete(`/reviews/${reviewId}`);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה במחיקת ביקורת'));
    }
  };

  if (!mountain) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isUserAdmin = user?.role === 'Admin';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {mountain.name}
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          מיקום: {mountain.location} | גובה: {mountain.height} מטר
        </Typography>

        {mountain.imageUrl && (
          <CardMedia
            component="img"
            image={mountain.imageUrl}
            alt={mountain.name}
            sx={{ maxHeight: 400, objectFit: 'cover', borderRadius: 2, my: 2 }}
          />
        )}

        <Typography variant="body1" sx={{ mt: 2 }}>
          {mountain.description}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          מסלולי הליכה בהר ({user ? trails.length : 0})
        </Typography>

        {!user ? (
          <Alert severity="info" sx={{ mt: 1, alignItems: 'center' }}>
            יש להתחבר למערכת כדי לצפות במסלולי ההליכה של ההר.
            <Button component={RouterLink} to="/login" variant="contained" size="small" sx={{ mr: 2 }}>
              להתחברות
            </Button>
          </Alert>
        ) : trails.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            עדיין לא נוספו מסלולים להר זה.
          </Typography>
        ) : (
          trails.map((trail) => (
            <Box
              key={trail.id}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 1,
                bgcolor: 'grey.50',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {trail.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אורך: {trail.lengthKm} ק"מ | דרגת קושי: {trail.difficulty} | {trail.isCircular ? 'מעגלי' : 'קווי'}
                </Typography>
              </Box>

              {isUserAdmin && (
                <IconButton color="error" onClick={() => handleDeleteTrail(trail.id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))
        )}

        {isUserAdmin && (
          <Box sx={{ mt: 2 }}>
            {!showAddTrail ? (
              <Button variant="outlined" onClick={() => setShowAddTrail(true)}>
                הוסף מסלול חדש
              </Button>
            ) : (
              <Box component="form" onSubmit={handleAddTrail} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="שם המסלול"
                  value={trailName}
                  onChange={(e) => setTrailName(e.target.value)}
                  required
                />
                <TextField
                  size="small"
                  label="אורך בקילומטרים"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={lengthKm}
                  onChange={(e) => setLengthKm(e.target.value)}
                  required
                />
                <TextField
                  size="small"
                  select
                  label="דרגת קושי"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <MenuItem value="קל">קל</MenuItem>
                  <MenuItem value="בינוני">בינוני</MenuItem>
                  <MenuItem value="קשה">קשה</MenuItem>
                  <MenuItem value="למיטיבי לכת">למיטיבי לכת</MenuItem>
                </TextField>
                <FormControlLabel
                  control={<Switch checked={isCircular} onChange={(e) => setIsCircular(e.target.checked)} />}
                  label="מסלול מעגלי"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained">
                    שמור מסלול
                  </Button>
                  <Button variant="text" onClick={() => setShowAddTrail(false)}>
                    ביטול
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          חוות דעת וביקורות ({reviews.length})
        </Typography>

        {reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            עדיין אין ביקורות על הר זה. היה הראשון לכתוב!
          </Typography>
        ) : (
          reviews.map((rev) => (
            <Box key={rev.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'משתמש אנונימי'}
                  </Typography>
                  <Rating value={rev.rating} size="small" readOnly />
                </Box>

                {(isUserAdmin || user?.id === rev.userId) && (
                  <IconButton size="small" color="error" onClick={() => handleDeleteReview(rev.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {rev.comment}
              </Typography>
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          ))
        )}

        {user ? (
          <Box component="form" onSubmit={handleAddReview} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              הוספת ביקורת
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="legend">דירוג:</Typography>
              <Rating
                name="rating-select"
                value={Number(rating)}
                onChange={(_, val) => setRating(String(val || 5))}
              />
            </Box>
            <TextField
              size="small"
              multiline
              rows={3}
              label="כתוב חוות דעת..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              שלח ביקורת
            </Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            יש להתחבר כדי לכתוב ביקורת.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
