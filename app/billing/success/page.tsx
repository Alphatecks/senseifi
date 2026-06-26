import type { Metadata } from "next";
import BillingSuccessClient from "./BillingSuccessClient";

export const metadata: Metadata = {
  title: "Subscription Successful | SenseiFi",
  description: "Your SenseiFi subscription payment was confirmed. Access your dashboard to get started.",
};

export default function BillingSuccessPage() {
  return <BillingSuccessClient />;
}
