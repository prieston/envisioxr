"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  textFieldStyles,
  showToast,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import useUser from "@/app/hooks/useUser";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isMostAsked: boolean;
}

const ALL_FAQS: FAQ[] = [
  // Getting Started
  {
    id: "getting-started-1",
    question: "How do I create my first project?",
    answer:
      "To create your first project, navigate to the Projects page from the sidebar and click the 'Create Project' button. You'll be asked to provide a title and optionally a description. Choose between Three.js or Cesium engine depending on your needs. Once created, you can start building your 3D scene.",
    category: "Getting Started",
    tags: ["project", "create", "first", "new"],
    isMostAsked: true,
  },
  {
    id: "getting-started-2",
    question: "What's the difference between Solo Workspace and Organisation Workspace?",
    answer:
      "Solo Workspace (Free) is perfect for individuals with 1 GB storage, 10 projects, and 1 private share. Organisation Workspace (Pro) at €149/month offers unlimited projects, unlimited members, unlimited private shares, 100 GB storage, full RBAC, branding, and priority support. Upgrade anytime from the Billing & Plans page.",
    category: "Getting Started",
    tags: ["workspace", "plans", "pricing", "free", "pro"],
    isMostAsked: true,
  },
  {
    id: "getting-started-3",
    question: "How do I upload 3D models to my project?",
    answer:
      "In the Builder, click the Asset Manager button in the toolbar. You can upload models directly to your library (stored in our S3 bucket) or upload to Cesium Ion if you have a Cesium Ion integration configured. Supported formats include .glb, .gltf, and .zip files.",
    category: "Getting Started",
    tags: ["upload", "models", "3d", "assets", "library"],
    isMostAsked: true,
  },

  // Projects & Scenes
  {
    id: "projects-1",
    question: "How do I publish my project?",
    answer:
      "In the Builder, click the 'Publish' button in the top toolbar. Your project will be published and you'll receive a shareable URL. You can make it public or keep it private. Published projects can be viewed by anyone with the link (if public) or only by organization members (if private).",
    category: "Projects & Scenes",
    tags: ["publish", "share", "url", "public"],
    isMostAsked: true,
  },
  {
    id: "projects-2",
    question: "What are the limits for published projects?",
    answer:
      "Solo Workspace allows up to 10 published projects. Organisation Workspace has unlimited published projects. Each published project gets a unique URL that you can share with others.",
    category: "Projects & Scenes",
    tags: ["publish", "limits", "projects"],
    isMostAsked: false,
  },
  {
    id: "projects-3",
    question: "Can I edit a project after publishing?",
    answer:
      "Yes! You can edit your project at any time. Changes are saved automatically. To update the published version, simply click 'Publish' again. The published URL will reflect your latest changes.",
    category: "Projects & Scenes",
    tags: ["edit", "publish", "update", "changes"],
    isMostAsked: false,
  },
  {
    id: "projects-4",
    question: "What's the difference between Three.js and Cesium engines?",
    answer:
      "Three.js engine is ideal for general 3D scenes, architectural visualizations, and product showcases. Cesium engine is designed for geospatial applications, maps, terrain, and real-world coordinate systems. Choose Cesium if you need geographic accuracy, terrain data, or satellite imagery integration.",
    category: "Projects & Scenes",
    tags: ["engine", "three", "cesium", "geospatial"],
    isMostAsked: true,
  },

  // Cesium Ion Integration
  {
    id: "cesium-1",
    question: "How do I set up Cesium Ion integration?",
    answer:
      "Go to Settings → Integrations and click 'Add Cesium Ion Integration'. You'll need two tokens from Cesium Ion: a read-only token (with assets:list and assets:read scopes) and an upload token (with assets:list, assets:read, and assets:write scopes). Create these tokens at https://ion.cesium.com/tokens.",
    category: "Cesium Ion",
    tags: ["cesium", "integration", "tokens", "setup"],
    isMostAsked: true,
  },
  {
    id: "cesium-2",
    question: "What are the Cesium upload limits?",
    answer:
      "Solo Workspace has a 5 GiB upload limit for Cesium Ion assets. Organisation Workspace has unlimited Cesium uploads. You can check your usage on the Usage page under Settings.",
    category: "Cesium Ion",
    tags: ["cesium", "upload", "limit", "storage"],
    isMostAsked: true,
  },
  {
    id: "cesium-3",
    question: "How do I sync my Cesium Ion assets?",
    answer:
      "After setting up your Cesium Ion integration, go to Settings → Integrations and click the 'Sync' button next to your integration. This will fetch all assets from your Cesium Ion account and make them available in your Geospatial Assets library.",
    category: "Cesium Ion",
    tags: ["cesium", "sync", "assets", "library"],
    isMostAsked: false,
  },
  {
    id: "cesium-4",
    question: "Can I upload assets directly to Cesium Ion from Klorad?",
    answer:
      "Yes! In the Geospatial Assets library, click 'Upload to Cesium Ion'. You'll need to provide your Cesium Ion access token with write permissions. The asset will be uploaded to your Cesium Ion account and then synced to your library.",
    category: "Cesium Ion",
    tags: ["cesium", "upload", "ion", "assets"],
    isMostAsked: false,
  },

  // Organization & Members
  {
    id: "org-1",
    question: "How do I invite members to my organization?",
    answer:
      "Go to Settings → Members and click 'Invite Member'. Enter the email address and select their role (Owner, Admin, or Member). They'll receive an email invitation to join your organization.",
    category: "Organization & Members",
    tags: ["invite", "members", "team", "collaboration"],
    isMostAsked: true,
  },
  {
    id: "org-2",
    question: "What are the different member roles?",
    answer:
      "Owner: Full control, can manage members, billing, and delete the organization. Admin: Can manage members and projects, but cannot change billing or delete the organization. Member: Can view and edit projects, but cannot manage members or settings.",
    category: "Organization & Members",
    tags: ["roles", "permissions", "owner", "admin", "member"],
    isMostAsked: true,
  },
  {
    id: "org-3",
    question: "How do I upgrade from Solo to Organisation Workspace?",
    answer:
      "Go to Billing & Plans and click 'Upgrade to Organisation Workspace'. You'll be asked to provide organization details (name and slug) and then redirected to payment. After successful payment, your organization workspace will be created with Pro plan features.",
    category: "Organization & Members",
    tags: ["upgrade", "billing", "pro", "workspace"],
    isMostAsked: true,
  },
  {
    id: "org-4",
    question: "Can I have multiple organizations?",
    answer:
      "Yes! You can be a member of multiple organizations. Each organization has its own projects, assets, and members. Use the organization switcher in the sidebar to switch between organizations.",
    category: "Organization & Members",
    tags: ["multiple", "organizations", "switch"],
    isMostAsked: false,
  },

  // Assets & Library
  {
    id: "assets-1",
    question: "Where are my uploaded files stored?",
    answer:
      "Files uploaded directly to Klorad are stored securely in our DigitalOcean Spaces (S3-compatible) storage. Cesium Ion assets are stored on Cesium's servers. You can check your storage usage on the Usage page.",
    category: "Assets & Library",
    tags: ["storage", "files", "s3", "digitalocean"],
    isMostAsked: false,
  },
  {
    id: "assets-2",
    question: "What file formats are supported?",
    answer:
      "For 3D models, we support .glb, .gltf, and .zip files. For geospatial assets, Cesium Ion supports various formats including 3D Tiles, Imagery, Terrain, CZML, KML, and GeoJSON. Check the Geospatial Assets page for the full list.",
    category: "Assets & Library",
    tags: ["formats", "files", "supported", "glb", "gltf"],
    isMostAsked: false,
  },
  {
    id: "assets-3",
    question: "How do I delete an asset?",
    answer:
      "In the Library (Models or Geospatial Assets), find the asset you want to delete and click the delete button. For Cesium Ion assets, this will also delete them from your Cesium Ion account. Regular assets will be removed from our storage.",
    category: "Assets & Library",
    tags: ["delete", "remove", "assets"],
    isMostAsked: false,
  },

  // Billing & Plans
  {
    id: "billing-1",
    question: "How does billing work?",
    answer:
      "Solo Workspace is completely free. Organisation Workspace costs €149/month and is billed monthly through Stripe. You can upgrade or manage your subscription from the Billing & Plans page. Enterprise plans are available with custom pricing - contact sales@klorad.com.",
    category: "Billing & Plans",
    tags: ["billing", "payment", "stripe", "subscription"],
    isMostAsked: true,
  },
  {
    id: "billing-2",
    question: "What happens if I exceed my storage limit?",
    answer:
      "Solo Workspace has a hard limit of 1 GB storage. If you exceed this, you'll need to delete some assets or upgrade to Organisation Workspace (100 GB included). Organisation Workspace also has hard limits, so plan accordingly.",
    category: "Billing & Plans",
    tags: ["storage", "limit", "exceed", "upgrade"],
    isMostAsked: false,
  },
  {
    id: "billing-3",
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your Organisation Workspace subscription at any time from the Billing & Plans page. Your subscription will remain active until the end of the billing period, after which you'll be downgraded to Solo Workspace.",
    category: "Billing & Plans",
    tags: ["cancel", "subscription", "downgrade"],
    isMostAsked: false,
  },

  // Technical
  {
    id: "technical-1",
    question: "How do I capture a screenshot of my scene?",
    answer:
      "In the Builder, use the screenshot capture feature in the toolbar. This will capture the current view of your scene and can be used as a thumbnail for your project or shared separately.",
    category: "Technical",
    tags: ["screenshot", "capture", "thumbnail"],
    isMostAsked: false,
  },
  {
    id: "technical-2",
    question: "Can I use my own Cesium Ion access token?",
    answer:
      "Yes! When uploading to Cesium Ion or setting up an integration, you can use your own Cesium Ion access token. Make sure it has the required scopes: assets:list, assets:read for read-only, and assets:write for uploads.",
    category: "Technical",
    tags: ["cesium", "token", "api", "access"],
    isMostAsked: false,
  },
  {
    id: "technical-3",
    question: "How do I access the API?",
    answer:
      "API access is available for Organisation Workspace plans. Solo Workspace has read-only API access. Full API documentation is available for Pro and Enterprise customers. Contact support for API credentials and documentation.",
    category: "Technical",
    tags: ["api", "access", "documentation"],
    isMostAsked: false,
  },
];

const SupportPage = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubject, setRequestSubject] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Filter FAQs based on search
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only most asked questions when no search
      return ALL_FAQS.filter((faq) => faq.isMostAsked);
    }

    const query = searchQuery.toLowerCase();
    const matches = ALL_FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        faq.category.toLowerCase().includes(query)
    );

    // If no matches, show request form
    if (matches.length === 0) {
      setShowRequestForm(true);
      return [];
    }

    setShowRequestForm(false);
    return matches;
  }, [searchQuery]);

  const handleSendRequest = async () => {
    if (!requestSubject.trim() || !requestMessage.trim()) {
      showToast("Please fill in both subject and message", "error");
      return;
    }

    setSendingRequest(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: requestSubject.trim(),
          message: requestMessage.trim(),
          userEmail: user?.email,
          userName: user?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send support request");
      }

      showToast("Support request sent successfully! We'll get back to you soon.", "success");
      setRequestSubject("");
      setRequestMessage("");
      setShowRequestForm(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error sending support request:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to send support request",
        "error"
      );
    } finally {
      setSendingRequest(false);
    }
  };

  // Group FAQs by category
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQ[]> = {};
    filteredFAQs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });
    return grouped;
  }, [filteredFAQs]);

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
      </AnimatedBackground>

      <Page>
        <PageHeader title="Support" />
        <PageDescription>
          Find answers to common questions or contact our support team
        </PageDescription>

        <PageContent>
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              placeholder="Search for help..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={(theme) => ({
                maxWidth: "600px",
                ...((typeof textFieldStyles === "function"
                  ? textFieldStyles(theme)
                  : textFieldStyles) as Record<string, unknown>),
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                      })}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* FAQs */}
          {!showRequestForm && Object.keys(faqsByCategory).length > 0 && (
            <Box sx={{ mb: 4 }}>
              {searchQuery && (
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}
                >
                  Search Results ({filteredFAQs.length})
                </Typography>
              )}
              {!searchQuery && (
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}
                >
                  Frequently Asked Questions
                </Typography>
              )}

              {Object.entries(faqsByCategory).map(([category, faqs]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {category}
                  </Typography>
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      sx={{
                        mb: 1,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.background.paper
                            : "#ffffff",
                        border: (theme) =>
                          `1px solid ${
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.1)"
                          }`,
                        boxShadow: "none",
                        "&:before": {
                          display: "none",
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                            })}
                          />
                        }
                        sx={{
                          "& .MuiAccordionSummary-content": {
                            my: 1.5,
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, pr: 2 }}
                        >
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
                        >
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ))}
            </Box>
          )}

          {/* Request Support Form */}
          {showRequestForm && (
            <Card
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#14171A" : "#ffffff",
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.1)"
                  }`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.05),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <HelpOutlineIcon
                      sx={(theme) => ({
                        fontSize: 24,
                        color: theme.palette.primary.main,
                      })}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Didn&apos;t find what you&apos;re looking for?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Send us a message and we&apos;ll get back to you as soon as possible
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Subject"
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                    placeholder="What can we help you with?"
                    fullWidth
                    sx={textFieldStyles}
                    disabled={sendingRequest}
                  />

                  <TextField
                    label="Message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    fullWidth
                    multiline
                    rows={6}
                    sx={textFieldStyles}
                    disabled={sendingRequest}
                  />

                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowRequestForm(false);
                        setSearchQuery("");
                        setRequestSubject("");
                        setRequestMessage("");
                      }}
                      disabled={sendingRequest}
                      sx={{ textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={
                        sendingRequest ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                      onClick={handleSendRequest}
                      disabled={sendingRequest}
                      sx={{ textTransform: "none" }}
                    >
                      {sendingRequest ? "Sending..." : "Send Request"}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Empty State - No Search */}
          {!showRequestForm && !searchQuery && filteredFAQs.length === 0 && (
            <Card
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#14171A" : "#ffffff",
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.1)"
                  }`,
                textAlign: "center",
                py: 6,
              }}
            >
              <CardContent>
                <HelpOutlineIcon
                  sx={{
                    fontSize: 64,
                    color: "text.secondary",
                    mb: 2,
                    opacity: 0.5,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Start typing to search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search for answers to common questions or browse the FAQ categories above
                </Typography>
              </CardContent>
            </Card>
          )}
        </PageContent>
      </Page>
    </>
  );
};

export default SupportPage;

