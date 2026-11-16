import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Mountain } from '../types';

// (#39)
interface MountainCardProps {
  mountain: Mountain;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}

// (#39)
export function MountainCard({
  mountain,
  isAdmin,
  onDelete,
}: MountainCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {mountain.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          מיקום: {mountain.location} | גובה: {mountain.height} מטר
        </Typography>
        <Chip
          size="small"
          label={`רמת קושי: ${mountain.difficultyLevel} מתוך 5`}
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5, mb: 1.5 }}
        />
        {mountain.description && (
          <Typography variant="body2">
            {mountain.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={`/mountains/${mountain.id}`}
        >
          לפרטים, מסלולים וביקורות
        </Button>
        {isAdmin && (
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(mountain.id)}
          >
            מחיקת הר
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
