export type SampleWorld = {
  id: string;
  url: string;
  imageThumbnail: string;
  title: string;
  description?: string;
  category?: string;
};

export const sampleWorlds: SampleWorld[] = [
  {
    id: "sample-1",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Urban Corridor Network",
    description: "Complete traffic management system for major metropolitan corridor",
    category: "Mobility & ITS",
  },
  {
    id: "sample-2",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Heritage Site Preservation",
    description: "3D documentation and monitoring of historical monument",
    category: "Cultural Heritage",
  },
  {
    id: "sample-3",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Agricultural Land Management",
    description: "Comprehensive field monitoring and yield optimization system",
    category: "Agriculture",
  },
  {
    id: "sample-4",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "City Infrastructure Planning",
    description: "Unified view of utilities, roads, and public works",
    category: "Urban Infrastructure",
  },
  {
    id: "sample-5",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Tunnel System Operations",
    description: "Real-time monitoring and coordination of underground infrastructure",
    category: "Infrastructure",
  },
  {
    id: "sample-6",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Traffic Signal Optimization",
    description: "Intelligent signal timing across interconnected junctions",
    category: "Mobility & ITS",
  },
  {
    id: "sample-7",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Archaeological Site Documentation",
    description: "High-fidelity 3D reconstruction for research and preservation",
    category: "Cultural Heritage",
  },
  {
    id: "sample-8",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Precision Agriculture Dashboard",
    description: "Field-level crop health and resource management",
    category: "Agriculture",
  },
  {
    id: "sample-9",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Smart City Operations Center",
    description: "Integrated platform for urban service coordination",
    category: "Urban Infrastructure",
  },
  {
    id: "sample-10",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Bridge Maintenance System",
    description: "Structural monitoring and inspection workflow management",
    category: "Infrastructure",
  },
  {
    id: "sample-11",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Highway Network Management",
    description: "End-to-end visibility of traffic flow and incidents",
    category: "Mobility & ITS",
  },
  {
    id: "sample-12",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Museum Virtual Experience",
    description: "Immersive digital interpretation of cultural collections",
    category: "Cultural Heritage",
  },
  {
    id: "sample-13",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Irrigation System Planning",
    description: "Water distribution optimization across agricultural zones",
    category: "Agriculture",
  },
  {
    id: "sample-14",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Public Transit Coordination",
    description: "Real-time bus and rail system integration",
    category: "Urban Infrastructure",
  },
  {
    id: "sample-15",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Construction Site Monitoring",
    description: "Progress tracking and stakeholder coordination",
    category: "Infrastructure",
  },
  {
    id: "sample-16",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Emergency Response Routing",
    description: "Dynamic path optimization for first responders",
    category: "Mobility & ITS",
  },
  {
    id: "sample-17",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Historical Landscape Reconstruction",
    description: "Time-based visualization of heritage site evolution",
    category: "Cultural Heritage",
  },
  {
    id: "sample-18",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Crop Yield Analysis",
    description: "Multi-season comparison and predictive modeling",
    category: "Agriculture",
  },
  {
    id: "sample-19",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Utility Network Mapping",
    description: "Underground infrastructure visualization and management",
    category: "Urban Infrastructure",
  },
  {
    id: "sample-20",
    url: "",
    imageThumbnail: "/images/samples/default.jpg",
    title: "Railway Corridor Operations",
    description: "Track maintenance and train coordination system",
    category: "Infrastructure",
  },
];

export function getSampleWorld(id: string) {
  return sampleWorlds.find((world) => world.id === id) ?? null;
}

