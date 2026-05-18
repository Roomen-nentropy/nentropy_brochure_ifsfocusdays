import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

const DashboardSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={400} height={24} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map(index => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={32}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="80%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 3 }} />
              {[1, 2, 3].map(index => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Skeleton variant="text" width={150} height={20} />
                    <Skeleton variant="text" width={50} height={20} />
                  </Box>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={8}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={150} height={28} sx={{ mb: 3 }} />
              {[1, 2, 3, 4, 5].map(index => (
                <Box
                  key={index}
                  sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Skeleton
                    variant="circular"
                    width={8}
                    height={8}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 3 }} />
          {[1, 2, 3].map(index => (
            <Box
              key={index}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
              <Skeleton
                variant="rectangular"
                width={60}
                height={20}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardSkeleton;
