"use client";

import { useState, useEffect } from "react";
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
  Button,
  IconButton,
  alpha,
  CircularProgress,
  Dialog,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Autocomplete,
} from "@mui/material";
import {
  PageCard,
  AddIcon,
  CloseIcon,
  showToast,
} from "@klorad/ui";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import useSWR from "swr";
import Image from "next/image";

interface ShowcaseTag {
  id: string;
  slug: string;
  label: string;
  color: string | null;
}

interface ShowcaseWorld {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  url: string;
  isPublished: boolean;
  priority: number;
  projectId: string | null;
  tags: ShowcaseTag[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  publishedUrl: string | null;
  isPublished: boolean;
  organization: {
    name: string;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

// Helper function to construct published URL from project ID
const getPublishedUrl = (projectId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return `${baseUrl}/publish/${projectId}`;
};

export function ShowcaseTab() {
  const {
    data: worldsData,
    error: worldsError,
    mutate: mutateWorlds,
  } = useSWR<{ worlds: ShowcaseWorld[] }>("/api/showcase/worlds", fetcher);
  const {
    data: tagsData,
    error: tagsError,
    mutate: mutateTags,
  } = useSWR<{ tags: ShowcaseTag[] }>("/api/showcase/tags", fetcher);

  const [worldDialogOpen, setWorldDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // World Form State
  const [editingWorld, setEditingWorld] = useState<ShowcaseWorld | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [worldForm, setWorldForm] = useState({
    title: "",
    description: "",
    url: "",
    thumbnailUrl: "",
    priority: 0,
    isPublished: false,
    tagIds: [] as string[],
  });

  // Tag Form State
  const [tagForm, setTagForm] = useState({
    label: "",
    slug: "",
    color: "",
  });

  // Search for projects
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchProjects = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/projects?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.projects || []);
        }
      } catch (error) {
        console.error("Failed to search projects:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProjects();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleProjectSelect = (project: Project | null) => {
    if (!project) {
      setSelectedProjectId(null);
      return;
    }

    setSelectedProjectId(project.id);
    // Construct full URL using NEXT_PUBLIC_APP_URL
    const fullUrl = getPublishedUrl(project.id);
    setWorldForm({
      title: project.title,
      description: project.description || "",
      url: fullUrl,
      thumbnailUrl: project.thumbnail || "",
      priority: 0,
      isPublished: project.isPublished,
      tagIds: [],
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleOpenWorldDialog = (world?: ShowcaseWorld) => {
    if (world) {
      setEditingWorld(world);
      setSelectedProjectId(world.projectId || null);
      setWorldForm({
        title: world.title,
        description: world.description || "",
        url: world.url,
        thumbnailUrl: world.thumbnailUrl || "",
        priority: world.priority,
        isPublished: world.isPublished,
        tagIds: world.tags.map((t) => t.id),
      });
    } else {
      setEditingWorld(null);
      setSelectedProjectId(null);
      setWorldForm({
        title: "",
        description: "",
        url: "",
        thumbnailUrl: "",
        priority: 0,
        isPublished: false,
        tagIds: [],
      });
    }
    setSearchQuery("");
    setSearchResults([]);
    setWorldDialogOpen(true);
  };

  const handleSaveWorld = async () => {
    setSaving(true);
    try {
      const method = editingWorld ? "PUT" : "POST";
      const body = {
        ...worldForm,
        id: editingWorld?.id,
        projectId: selectedProjectId,
      };

      const res = await fetch("/api/showcase/worlds", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save world");

      showToast(
        `World ${editingWorld ? "updated" : "created"} successfully`,
        "success"
      );
      mutateWorlds();
      setWorldDialogOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to save world", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorld = async (id: string) => {
    if (!confirm("Are you sure you want to delete this world?")) return;
    try {
      const res = await fetch(`/api/showcase/worlds?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete world");
      showToast("World deleted successfully", "success");
      mutateWorlds();
    } catch (error) {
      showToast("Failed to delete world", "error");
    }
  };

  const handleSaveTag = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/showcase/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tagForm),
      });

      if (!res.ok) throw new Error("Failed to create tag");

      showToast("Tag created successfully", "success");
      mutateTags();
      setTagDialogOpen(false);
      setTagForm({ label: "", slug: "", color: "" });
    } catch (error) {
      showToast("Failed to create tag", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      const res = await fetch(`/api/showcase/tags?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tag");
      showToast("Tag deleted successfully", "success");
      mutateTags();
    } catch (error) {
      showToast("Failed to delete tag", "error");
    }
  };

  if (worldsError || tagsError) {
    return (
      <Box p={2}>
        <Typography color="error">Failed to load showcase data</Typography>
      </Box>
    );
  }

  if (!worldsData || !tagsData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Worlds Section */}
        <Grid item xs={12} md={8}>
          <PageCard>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={600}>
                Showcase Worlds
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenWorldDialog()}
                size="small"
              >
                Add World
              </Button>
            </Box>
            <TableContainer>
              <Table size="small" sx={{ "& .MuiTableCell-root": { borderColor: "rgba(255, 255, 255, 0.08)" } }}>
                <TableHead>
                  <TableRow sx={{ "& .MuiTableCell-head": { fontWeight: 600, color: "text.primary", backgroundColor: "rgba(255, 255, 255, 0.02)" } }}>
                    <TableCell>Title</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Priority</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {worldsData.worlds.map((world) => (
                    <TableRow
                      key={world.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          transition: "background-color 0.2s ease",
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                          {world.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.7rem",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "300px",
                          }}
                        >
                          {world.url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {world.tags.map((tag) => (
                            <Chip
                              key={tag.id}
                              label={tag.label}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                backgroundColor: tag.color
                                  ? alpha(tag.color, 0.15)
                                  : alpha("#6b9cd8", 0.1),
                                color: tag.color || "#6b9cd8",
                                borderColor: tag.color
                                  ? alpha(tag.color, 0.4)
                                  : alpha("#6b9cd8", 0.3),
                                border: "1px solid",
                                "&:hover": {
                                  backgroundColor: tag.color
                                    ? alpha(tag.color, 0.2)
                                    : alpha("#6b9cd8", 0.15),
                                },
                                transition: "background-color 0.2s ease",
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={world.isPublished ? "Published" : "Draft"}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            backgroundColor: world.isPublished
                              ? alpha("#22c55e", 0.15)
                              : alpha("rgba(255, 255, 255, 0.1)", 0.1),
                            color: world.isPublished ? "#22c55e" : "text.secondary",
                            borderColor: world.isPublished
                              ? alpha("#22c55e", 0.4)
                              : "rgba(255, 255, 255, 0.08)",
                            border: "1px solid",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {world.priority}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenWorldDialog(world)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              color: "primary.main",
                              backgroundColor: alpha("#6b9cd8", 0.1),
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWorld(world.id)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              color: "error.main",
                              backgroundColor: alpha("#ef4444", 0.1),
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PageCard>
        </Grid>

        {/* Tags Section */}
        <Grid item xs={12} md={4}>
          <PageCard>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={600}>
                Tags
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setTagDialogOpen(true)}
                size="small"
              >
                Add Tag
              </Button>
            </Box>
            {tagsData.tags.length === 0 ? (
              <Box
                sx={{
                  py: 3,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">No tags yet. Create one to get started.</Typography>
              </Box>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {tagsData.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.label}
                    onDelete={() => handleDeleteTag(tag.id)}
                    sx={{
                      height: 28,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: tag.color
                        ? alpha(tag.color, 0.15)
                        : alpha("#6b9cd8", 0.1),
                      color: tag.color || "#6b9cd8",
                      borderColor: tag.color
                        ? alpha(tag.color, 0.4)
                        : alpha("#6b9cd8", 0.3),
                      border: "1px solid",
                      "&:hover": {
                        backgroundColor: tag.color
                          ? alpha(tag.color, 0.2)
                          : alpha("#6b9cd8", 0.15),
                      },
                      "& .MuiChip-deleteIcon": {
                        color: tag.color || "#6b9cd8",
                        "&:hover": {
                          color: tag.color || "#5f88c7",
                        },
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Box>
            )}
          </PageCard>
        </Grid>
      </Grid>

      {/* World Dialog */}
      <Dialog
        open={worldDialogOpen}
        onClose={() => setWorldDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(17, 19, 23, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
          },
        }}
      >
        <Box p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            pb={2}
            sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingWorld ? "Edit World" : "Add Showcase World"}
            </Typography>
            <IconButton
              onClick={() => setWorldDialogOpen(false)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" gap={3}>
            {!editingWorld && (
              <Autocomplete
                options={searchResults}
                loading={searchLoading}
                getOptionLabel={(option) => option.title}
                inputValue={searchQuery}
                onInputChange={(_, newValue) => setSearchQuery(newValue)}
                onChange={(_, newValue) => handleProjectSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for a project"
                    placeholder="Type to search projects..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                      py: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.organization.name}
                        {option.description && ` • ${option.description.substring(0, 50)}${option.description.length > 50 ? "..." : ""}`}
                      </Typography>
                      {option.isPublished && (
                        <Chip
                          label="Published"
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 18,
                            fontSize: "0.65rem",
                            backgroundColor: alpha("#22c55e", 0.15),
                            color: "#22c55e",
                            border: `1px solid ${alpha("#22c55e", 0.4)}`,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
                noOptionsText={searchQuery ? "No projects found" : "Start typing to search"}
                sx={{ mb: 1 }}
              />
            )}
            <TextField
              label="Title"
              value={worldForm.title}
              onChange={(e) =>
                setWorldForm({ ...worldForm, title: e.target.value })
              }
              fullWidth
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
              }}
            />
            <TextField
              label="Description"
              value={worldForm.description}
              onChange={(e) =>
                setWorldForm({ ...worldForm, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
              }}
            />
            <TextField
              label="URL (Project Link)"
              value={worldForm.url}
              onChange={(e) =>
                setWorldForm({ ...worldForm, url: e.target.value })
              }
              fullWidth
              required
              helperText={
                selectedProjectId
                  ? "URL is auto-generated from selected project"
                  : "Enter full URL or select a project to auto-generate"
              }
              InputProps={{
                readOnly: !!selectedProjectId,
              }}
            />
            <TextField
              label="Thumbnail URL"
              value={worldForm.thumbnailUrl}
              onChange={(e) =>
                setWorldForm({ ...worldForm, thumbnailUrl: e.target.value })
              }
              fullWidth
              helperText="URL to the thumbnail image for this showcase world"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
              }}
            />
            {worldForm.thumbnailUrl && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 200,
                  height: 120,
                  borderRadius: "4px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Image
                  src={worldForm.thumbnailUrl}
                  alt="Thumbnail preview"
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                  unoptimized
                />
              </Box>
            )}
            <Box display="flex" gap={2}>
              <TextField
                label="Priority (Sort Order)"
                type="number"
                value={worldForm.priority}
                onChange={(e) =>
                  setWorldForm({
                    ...worldForm,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={worldForm.isPublished}
                    onChange={(e) =>
                      setWorldForm({
                        ...worldForm,
                        isPublished: e.target.checked,
                      })
                    }
                  />
                }
                label="Published"
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={worldForm.tagIds}
                label="Tags"
                onChange={(e) => {
                  const value = e.target.value;
                  setWorldForm({
                    ...worldForm,
                    tagIds: typeof value === "string" ? value.split(",") : value,
                  });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const tag = tagsData.tags.find((t) => t.id === value);
                      return <Chip key={value} label={tag?.label || value} size="small" />;
                    })}
                  </Box>
                )}
              >
                {tagsData.tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              display="flex"
              justifyContent="flex-end"
              gap={1}
              mt={3}
              pt={2}
              sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <Button
                onClick={() => setWorldDialogOpen(false)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveWorld}
                disabled={saving}
                sx={{
                  backgroundColor: "#6b9cd8",
                  "&:hover": {
                    backgroundColor: "#5f88c7",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(17, 19, 23, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
          },
        }}
      >
        <Box p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            pb={2}
            sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New Tag
            </Typography>
            <IconButton
              onClick={() => setTagDialogOpen(false)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Label"
              value={tagForm.label}
              onChange={(e) =>
                setTagForm({ ...tagForm, label: e.target.value })
              }
              fullWidth
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
              }}
            />
            <TextField
              label="Color (Hex)"
              value={tagForm.color}
              onChange={(e) =>
                setTagForm({ ...tagForm, color: e.target.value })
              }
              fullWidth
              placeholder="#6b9cd8"
              helperText="Optional hex color code (e.g., #6b9cd8). Leave empty for default."
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  },
                },
              }}
            />
            {tagForm.color && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "4px",
                  backgroundColor: tagForm.color,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              />
            )}
            <Box
              display="flex"
              justifyContent="flex-end"
              gap={1}
              mt={2}
              pt={2}
              sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <Button
                onClick={() => setTagDialogOpen(false)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveTag}
                disabled={saving}
                sx={{
                  backgroundColor: "#6b9cd8",
                  "&:hover": {
                    backgroundColor: "#5f88c7",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {saving ? "Creating..." : "Create"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

