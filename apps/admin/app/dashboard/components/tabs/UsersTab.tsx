"use client";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  CircularProgress,
} from "@mui/material";
import { PageCard } from "@klorad/ui";
import useSWR from "swr";

interface UsersData {
  users: {
    total: number;
    all: Array<{
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      organizationCount: number;
      activityCount: number;
    }>;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export function UsersTab() {
  const { data, error, isLoading } = useSWR<UsersData>(
    "/api/stats?section=users",
    fetcher
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Failed to load users</Typography>
      </Box>
    );
  }

  if (!data?.users) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <PageCard>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, fontSize: "1rem" }}
        >
          Users ({data.users.all.length})
        </Typography>
        <TableContainer
          component={Box}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            maxHeight: 600,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "transparent" }}>
                <TableCell
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.primary",
                    fontWeight: 600,
                    backgroundColor: "transparent",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.primary",
                    fontWeight: 600,
                    backgroundColor: "transparent",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.primary",
                    fontWeight: 600,
                    backgroundColor: "transparent",
                  }}
                >
                  Verified
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.primary",
                    fontWeight: 600,
                    backgroundColor: "transparent",
                  }}
                >
                  Organizations
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.primary",
                    fontWeight: 600,
                    backgroundColor: "transparent",
                  }}
                >
                  Activities
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.all.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                >
                  <TableCell>
                    {user.name ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.75rem",
                          color: "text.primary",
                        }}
                      >
                        {user.name}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.75rem",
                          color: "text.secondary",
                        }}
                      >
                        No name
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.primary",
                      }}
                    >
                      {user.email || "No email"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {user.emailVerified ? (
                      <Chip
                        label="Yes"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          backgroundColor: alpha("#22c55e", 0.1),
                          color: "#22c55e",
                          border: `1px solid ${alpha("#22c55e", 0.3)}`,
                        }}
                      />
                    ) : (
                      <Chip
                        label="No"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          backgroundColor: alpha("#6B9CD8", 0.1),
                          color: "#6B9CD8",
                          border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.primary",
                      }}
                    >
                      {user.organizationCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.primary",
                      }}
                    >
                      {user.activityCount}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>
    </Box>
  );
}

