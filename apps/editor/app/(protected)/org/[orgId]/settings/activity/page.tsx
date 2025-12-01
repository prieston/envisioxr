"use client";

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  formatTimeAgo,
} from "@klorad/ui";
import {
  CloudUploadIcon,
  SensorsIcon,
  MapIcon,
  PersonAddIcon,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import { useOrgId } from "@/app/hooks/useOrgId";
import usePaginatedActivity from "@/app/hooks/usePaginatedActivity";

const SettingsActivityPage = () => {
  const orgId = useOrgId();
  const {
    activities,
    loadingActivity,
    error,
    page,
    totalPages,
    handlePageChange,
  } = usePaginatedActivity({ pageSize: 50 });

  const getActivityIcon = (entityType: string) => {
    if (entityType === "MODEL" || entityType === "GEOSPATIAL_ASSET") {
      return <CloudUploadIcon />;
    } else if (entityType === "SENSOR") {
      return <SensorsIcon />;
    } else if (entityType === "PROJECT") {
      return <MapIcon />;
    } else if (entityType === "USER") {
      return <PersonAddIcon />;
    } else {
      return <CloudUploadIcon />;
    }
  };

  const getActivityTitle = (activity: any) => {
    return (
      activity.message ||
      `${activity.entityType} ${activity.action.toLowerCase()}`
    );
  };

  const getActivityDescription = (activity: any) => {
    return (
      activity.project?.title ||
      (activity.metadata && typeof activity.metadata === "object"
        ? (activity.metadata as { assetName?: string; projectTitle?: string })
            .assetName ||
          (activity.metadata as { assetName?: string; projectTitle?: string })
            .projectTitle ||
          ""
        : "")
    );
  };

  if (loadingActivity) {
    return (
      <>
        <AnimatedBackground>
          <GlowingContainer>
            <GlowingSpan index={1} />
            <GlowingSpan index={2} />
            <GlowingSpan index={3} />
          </GlowingContainer>
        </AnimatedBackground>
        <Page>
          <PageHeader title="Activity" />
          <PageContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          </PageContent>
        </Page>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AnimatedBackground>
          <GlowingContainer>
            <GlowingSpan index={1} />
            <GlowingSpan index={2} />
            <GlowingSpan index={3} />
          </GlowingContainer>
        </AnimatedBackground>
        <Page>
          <PageHeader title="Activity" />
          <PageContent>
            <Typography color="error">
              Failed to load activity. Please try again later.
            </Typography>
          </PageContent>
        </Page>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Page>
        <PageHeader title="Activity" />
        <PageDescription>
          View all activity and events across your organization
        </PageDescription>

        <PageContent maxWidth="6xl">
          <PageCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: "1rem" }}>
              Activity Log
            </Typography>

            {activities.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No activity yet
                </Typography>
                <Typography variant="body2">
                  Activity will appear here as you use the platform
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer
                  component={Box}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Activity
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Description
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Actor
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow
                          key={activity.id}
                          hover
                          sx={{
                            backgroundColor: "transparent",
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                            "& .MuiTableCell-root": {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 32,
                                  height: 32,
                                  borderRadius: "4px",
                                  backgroundColor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.15),
                                  color: (theme) => theme.palette.primary.main,
                                }}
                              >
                                {getActivityIcon(activity.entityType)}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  color: "text.primary",
                                }}
                              >
                                {getActivityTitle(activity)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {getActivityDescription(activity) || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={activity.actor.image || undefined}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {(activity.actor.name || activity.actor.email)
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {activity.actor.name || activity.actor.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {formatTimeAgo(new Date(activity.createdAt))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "text.primary",
                          "&.Mui-selected": {
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.15),
                            color: (theme) => theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.25),
                            },
                          },
                          "&:hover": {
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </PageCard>
        </PageContent>
      </Page>
    </>
  );
};

export default SettingsActivityPage;

