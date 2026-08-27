// EKSU Faculties and Departments
export const EKSU_FACULTIES: Record<string, string[]> = {
  "Agriculture": [
    "Agricultural Economics & Extension",
    "Animal Production & Health",
    "Crop, Soil & Environmental Sciences",
    "Fisheries & Aquaculture",
    "Food Science & Technology",
  ],
  "Arts": [
    "English & Literary Studies",
    "History & International Studies",
    "Linguistics & African Languages",
    "Philosophy",
    "Theatre & Media Arts",
  ],
  "Education": [
    "Adult Education",
    "Curriculum Studies & Educational Technology",
    "Educational Management",
    "Guidance & Counselling",
    "Human Kinetics & Health Education",
    "Primary Education Studies",
    "Science Education",
    "Social Science Education",
  ],
  "Engineering": [
    "Agricultural & Bio-Environmental Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Electrical & Electronic Engineering",
    "Mechanical Engineering",
  ],
  "Environmental Studies": [
    "Architecture",
    "Building",
    "Estate Management",
    "Quantity Surveying",
    "Urban & Regional Planning",
  ],
  "Law": ["Law"],
  "Medicine": [
    "Anatomy",
    "Biochemistry",
    "Human Physiology",
    "Medical Laboratory Science",
    "Nursing Science",
  ],
  "Science": [
    "Biochemistry",
    "Biology",
    "Chemistry",
    "Computer Science",
    "Geology",
    "Mathematics",
    "Microbiology",
    "Physics",
    "Statistics",
  ],
  "Social & Management Sciences": [
    "Accounting",
    "Banking & Finance",
    "Business Administration",
    "Economics",
    "Mass Communication",
    "Political Science",
    "Psychology",
    "Public Administration",
    "Sociology",
  ],
};

export const FACULTY_LIST = Object.keys(EKSU_FACULTIES);

export const LEVEL_LIST = ["100", "200", "300", "400", "500", "600"];

export function getDepartmentsForFaculty(faculty: string): string[] {
  return EKSU_FACULTIES[faculty] ?? [];
}
