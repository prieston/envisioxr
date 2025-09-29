import React from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Chip,
} from "@mui/material";
import {
  StyledDialog,
  DialogHeader,
  TabPanel,
  FeatureCard,
  TutorialCard,
  FAQItem,
} from "./HelpPopup.styles";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanelComponent(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <TabPanel>{children}</TabPanel>}
    </div>
  );
}

interface HelpPopupProps {
  open: boolean;
  onClose: () => void;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const features = [
    {
      title: "3D Scene Building",
      description:
        "Create immersive 3D environments with drag-and-drop simplicity",
      icon: <BuildOutlinedIcon />,
    },
    {
      title: "Model Import",
      description: "Upload and integrate 3D models from various formats",
      icon: <BuildOutlinedIcon />,
    },
    {
      title: "Real-time Preview",
      description: "See your changes instantly with live 3D preview",
      icon: <BuildOutlinedIcon />,
    },
    {
      title: "Publishing",
      description: "Share your creations with the world",
      icon: <BuildOutlinedIcon />,
    },
  ];

  const tutorials = [
    {
      title: "Getting Started with EnvisioXR",
      duration: "5:30",
      description: "Learn the basics of creating your first 3D scene",
      url: "#",
    },
    {
      title: "Importing 3D Models",
      duration: "8:15",
      description: "Step-by-step guide to adding 3D models to your project",
      url: "#",
    },
    {
      title: "Advanced Scene Building",
      duration: "12:45",
      description: "Master advanced techniques for complex scenes",
      url: "#",
    },
    {
      title: "Publishing Your Project",
      duration: "6:20",
      description: "How to share and publish your 3D creations",
      url: "#",
    },
  ];

  const faqs = [
    {
      question: "What file formats are supported for 3D models?",
      answer:
        "We support GLTF, GLB, OBJ, FBX, and STL formats. GLTF/GLB are recommended for best performance.",
    },
    {
      question: "How do I share my project with others?",
      answer:
        "Use the publish feature to generate a shareable link. You can also export your project for offline viewing.",
    },
    {
      question: "Can I collaborate with others on a project?",
      answer:
        "Currently, projects are single-user. Team collaboration features are coming soon!",
    },
    {
      question: "What are the system requirements?",
      answer:
        "EnvisioXR works in modern browsers with WebGL support. Chrome, Firefox, and Safari are recommended.",
    },
    {
      question: "How do I optimize my 3D models?",
      answer:
        "Keep polygon counts reasonable, use compressed textures, and optimize your models before importing for best performance.",
    },
  ];

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "inherit",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            pointerEvents: "none",
            zIndex: -1,
          },
        },
      }}
    >
      <DialogHeader>
        <Box
          sx={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "6px",
            backgroundColor: "rgba(37, 99, 235, 0.02)",
          }}
        >
          <HelpOutlineIcon
            sx={{
              color: "var(--glass-text-secondary, #646464)",
              fontSize: "24px",
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <DialogTitle
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              fontWeight: 600,
              fontSize: "1.5rem",
              padding: 0,
            }}
          >
            Help Center
          </DialogTitle>
          <Typography
            variant="body2"
            sx={{
              color: "var(--glass-text-secondary, #646464)",
              marginTop: "4px",
            }}
          >
            Everything you need to know about EnvisioXR
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "var(--glass-text-secondary, #646464)",
            "&:hover": {
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              color: "var(--glass-text-primary, #2563eb)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ padding: "0 32px 32px 32px" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "rgba(37, 99, 235, 0.08)",
            marginBottom: 3,
            "& .MuiTabs-flexContainer": {
              gap: "8px",
            },
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="help tabs"
            sx={{
              "& .MuiTab-root": {
                color: "var(--glass-text-secondary, #646464)",
                fontWeight: 500,
                fontSize: "0.95rem",
                padding: "16px 24px",
                borderRadius: "0",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
                  color: "var(--glass-text-primary, #2563eb)",
                },
                "&.Mui-selected": {
                  color: "var(--glass-text-primary, #2563eb)",
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--glass-text-primary, #2563eb)",
                height: "3px",
                borderRadius: "2px",
              },
            }}
          >
            <Tab
              icon={<BuildOutlinedIcon />}
              iconPosition="start"
              label="Features"
              id="help-tab-0"
              aria-controls="help-tabpanel-0"
            />
            <Tab
              icon={<VideoLibraryOutlinedIcon />}
              iconPosition="start"
              label="Tutorials"
              id="help-tab-1"
              aria-controls="help-tabpanel-1"
            />
            <Tab
              icon={<QuestionAnswerOutlinedIcon />}
              iconPosition="start"
              label="FAQ"
              id="help-tab-2"
              aria-controls="help-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanelComponent value={tabValue} index={0}>
          <Typography
            variant="h6"
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              marginBottom: 2,
            }}
          >
            What you can do with EnvisioXR
          </Typography>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    color: "var(--glass-text-primary, #2563eb)",
                    marginTop: "4px",
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "var(--glass-text-primary, #2563eb)",
                      fontWeight: 600,
                      marginBottom: 0.5,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--glass-text-secondary, #646464)",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </FeatureCard>
          ))}
        </TabPanelComponent>

        <TabPanelComponent value={tabValue} index={1}>
          <Typography
            variant="h6"
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              marginBottom: 2,
            }}
          >
            Video Tutorials
          </Typography>
          {tutorials.map((tutorial, index) => (
            <TutorialCard key={index}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    color: "var(--glass-text-primary, #2563eb)",
                    marginTop: "4px",
                  }}
                >
                  <PlayCircleOutlineIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginBottom: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "var(--glass-text-primary, #2563eb)",
                        fontWeight: 600,
                      }}
                    >
                      {tutorial.title}
                    </Typography>
                    <Chip
                      label={tutorial.duration}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(37, 99, 235, 0.1)",
                        color: "var(--glass-text-primary, #2563eb)",
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--glass-text-secondary, #646464)",
                    }}
                  >
                    {tutorial.description}
                  </Typography>
                </Box>
              </Box>
            </TutorialCard>
          ))}
        </TabPanelComponent>

        <TabPanelComponent value={tabValue} index={2}>
          <Typography
            variant="h6"
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              marginBottom: 2,
            }}
          >
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <FAQItem key={index}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "var(--glass-text-primary, #2563eb)",
                  fontWeight: 600,
                  marginBottom: 1,
                }}
              >
                {faq.question}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--glass-text-secondary, #646464)",
                  lineHeight: 1.6,
                }}
              >
                {faq.answer}
              </Typography>
            </FAQItem>
          ))}
        </TabPanelComponent>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "24px 32px 32px 32px",
          borderTop: "1px solid rgba(37, 99, 235, 0.08)",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "rgba(37, 99, 235, 0.2)",
            color: "var(--glass-text-primary, #2563eb)",
            fontWeight: 500,
            padding: "12px 24px",
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.95rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "var(--glass-text-primary, #2563eb)",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default HelpPopup;
