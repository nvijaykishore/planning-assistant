import { Suspense } from "react";
import { BriefForm } from "../../../components/BriefForm";

export default function NewPlanPage() {
  return (
    <Suspense fallback={<p className="wrap quiet">Opening the brief…</p>}>
      <BriefForm />
    </Suspense>
  );
}
