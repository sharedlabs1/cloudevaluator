// Define the ProctorSession model
export class ProctorSession {
  id: number;
  studentName: string;
  assessmentTitle: string;
  startTime: Date;

  // Add a constructor to initialize properties
  constructor(id: number, studentName: string, assessmentTitle: string, startTime: Date) {
    this.id = id;
    this.studentName = studentName;
    this.assessmentTitle = assessmentTitle;
    this.startTime = startTime;
  }
}