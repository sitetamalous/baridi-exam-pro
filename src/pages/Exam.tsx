
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import ExamPlayerPage from "./ExamPlayerPage";
import ExamReviewPage from "./ExamReviewPage";

const Exam: React.FC = () => {
  const location = useLocation();
  const { examId } = useParams();
  // صفحة المراجعة: يتم الانتقال إليها إذا كان state = { review: true } أو path يحتوي review
  const isReview = location.pathname.endsWith("/review");
  if (isReview) return <ExamReviewPage />;
  return <ExamPlayerPage />;
};

export default Exam;
