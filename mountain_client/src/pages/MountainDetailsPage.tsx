import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
  const [errorMsg, setErrorMsg] = useState('');

  const [trailName, setTrailName] = useState('');
  const [trailLength, setTrailLength] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [trailDifficulty, setTrailDifficulty] = useState('3');
  const [isCircular, setIsCircular] = useState(false);
  const [showAddTrail, setShowAddTrail] = useState(false);

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  // (#47)
  const fetchMountainData = useCallback(async () => {
    if (!id) return;
    try {
      setErrorMsg('');
      const [mountainRes, trailsRes, reviewsRes] = await Promise.all([
        axiosClient.get<Mountain>(`/mountains/${id}`),
        axiosClient.get<Trail[]>(`/mountains/${id}/trails`),
        axiosClient.get<Review[]>(`/mountains/${id}/reviews`),
      ]);
      setMountain(mountainRes.data);
      setTrails(trailsRes.data);
      setReviews(reviewsRes.data);
    } catch {
      setErrorMsg('שגיאה בטעינת נתוני ההר');
    }
  }, [id]);

  // (#47)
  useEffect(() => {
    fetchMountainData();
  }, [fetchMountainData]);

  // (#47)
  const handleAddTrail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await axiosClient.post(`/mountains/${id}/trails`, {
        name: trailName,
        length: Number(trailLength),
        estimatedTime: Number(estimatedTime),
        difficultyLevel: Number(trailDifficulty),
        isCircular,
      });
      setTrailName('');
      setTrailLength('');
      setEstimatedTime('');
      setTrailDifficulty('3');
      setIsCircular(false);
      setShowAddTrail(false);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה בהוספת המסלול'));
    }
  };

  // (#47)
  const handleDeleteTrail = async (trailId: number) => {
    try {
      await axiosClient.delete(`/trails/${trailId}`);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה במחיקת המסלול'));
    }
  };

  // (#54)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await axiosClient.post(`/mountains/${id}/reviews`, {
        rating: Number(rating),
        comment,
      });
      setRating('5');
      setComment('');
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה בשליחת הביקורת'));
    }
  };

  // (#54)
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await axiosClient.delete(`/reviews/${reviewId}`);
      fetchMountainData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'שגיאה במחיקת הביקורת'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Button component={RouterLink} to="/" variant="outlined" size="small" sx={{ mb: 2 }}>
        חזרה לכל ההרים
      </Button>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {mountain && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {mountain.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            מיקום: {mountain.location} | גובה: {mountain.height} מטר | רמת קושי: {mountain.difficultyLevel}/5
          </Typography>
          {mountain.description && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {mountain.description}
            </Typography>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          מסלולי הליכה בהר ({trails.length})
        </Typography>

        {trails.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            עדיין לא נוספו מסלולים להר זה.
          </Typography>
        ) : (
          trails.map((trail) => (
            <Box
              key={trail.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                borderBottom: '1px solid #eee',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {trail.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אורך: {trail.length} ק&quot;מ | זמן משוער: {trail.estimatedTime} דקות | קושי: {trail.difficultyLevel}/5 |{' '}
                  {trail.isCircular ? 'מסלול מעגלי' : 'מסלול קווי'}
                </Typography>
              </Box>
              {user?.role === 'admin' && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTrail(trail.id)}
                >
                  מחק מסלול
                </Button>
              )}
            </Box>
          ))
        )}

        {user && !showAddTrail && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAddTrail(true)}
            >
              + הוספת מסלול חדש להר
            </Button>
          </Box>
        )}

        {user && showAddTrail && (
          <Box component="form" onSubmit={handleAddTrail} sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                הוספת מסלול חדש להר
              </Typography>
              <Button size="small" color="inherit" onClick={() => setShowAddTrail(false)}>
                ביטול
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <TextField
                size="small"
                label="שם המסלול"
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                required
              />
              <TextField
                size="small"
                label="אורך (ק״מ)"
                type="number"
                inputProps={{ step: '0.1' }}
                value={trailLength}
                onChange={(e) => setTrailLength(e.target.value)}
                required
              />
              <TextField
                size="small"
                label="זמן משוער (דקות)"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                required
              />
              <TextField
                size="small"
                label="רמת קושי (1-5)"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                value={trailDifficulty}
                onChange={(e) => setTrailDifficulty(e.target.value)}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCircular}
                    onChange={(e) => setIsCircular(e.target.checked)}
                  />
                }
                label="מסלול מעגלי"
              />
              <Button type="submit" variant="contained" size="small">
                שמור מסלול
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ביקורות ודירוגים של מטיילים ({reviews.length})
        </Typography>

        {reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            עדיין אין ביקורות להר זה. היו הראשונים לדרג!
          </Typography>
        ) : (
          reviews.map((review) => (
            <Box
              key={review.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                py: 1.5,
                borderBottom: '1px solid #eee',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip size="small" color="secondary" label={`דירוג: ${review.rating}/5`} />
                  <Typography variant="caption" color="text.secondary">
                    נכתב על ידי: {review.user?.firstName || review.user?.email || `משתמש #${review.userId}`}
                  </Typography>
                </Box>
                <Typography variant="body2">{review.comment}</Typography>
              </Box>
              {user && (Number(user.sub) === Number(review.userId) || user.role === 'admin') && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  מחק ביקורת
                </Button>
              )}
            </Box>
          ))
        )}

        {user && (
          <Box component="form" onSubmit={handleAddReview} sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              כתיבת ביקורת חדשה
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label="דירוג (1-5)"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                 sx={{ width: 120 }}
                required
              />
              <TextField
                size="small"
                fullWidth
                label="תוכן הביקורת שלך..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <Button type="submit" variant="contained" color="secondary" size="small">
                שלח ביקורת
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
