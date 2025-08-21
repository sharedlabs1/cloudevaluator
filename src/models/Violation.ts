// Define the Violation model
export class Violation {
  id: number;
  studentName: string;
  assessmentTitle: string;
  type: string;
  timestamp: Date;

  // Add a constructor to initialize properties
  constructor(id: number, studentName: string, assessmentTitle: string, type: string, timestamp: Date) {
    this.id = id;
    this.studentName = studentName;
    this.assessmentTitle = assessmentTitle;
    this.type = type;
    this.timestamp = timestamp;
  }
}