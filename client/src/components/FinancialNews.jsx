import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Link,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getFinancialNews } from '../services/userService';

const categories = [
  'All',
  'Stock Market',
  'Real Estate',
  'Forex',
  'Cryptocurrency',
  'Economy',
  'Personal Finance'
];

export default function FinancialNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getFinancialNews();
        setNews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Financial News & Insights
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategory(cat)}
                color={category === cat ? 'primary' : 'default'}
                variant={category === cat ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {filteredNews.length > 0 ? (
          filteredNews.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  component="img"
                  sx={{
                    height: 140,
                    width: '100%',
                    objectFit: 'cover'
                  }}
                  src={item.image || 'https://source.unsplash.com/random?finance'}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip label={item.category} size="small" sx={{ mb: 1 }} />
                  <Typography gutterBottom variant="h6" component="h3">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.date).toLocaleDateString()} • {item.source}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Link href={item.url} target="_blank" rel="noopener">
                    Read more
                  </Link>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No news found matching your criteria</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}