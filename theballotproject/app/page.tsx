"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/lib/mutations/userMutations";
import Loader from "@/components/ui/loader";

const HomePageRedirect: React.FC = () => {
  const router = useRouter();

  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    console.log("ME_QUERY - loading:", loading);
    console.log("ME_QUERY - data:", data);
    console.log("ME_QUERY - error:", error);

    if (!loading) {
      if (data?.me) {
        router.push("/elections");
      } else {
        router.push("/auth");
      }
    }
  }, [loading, data, error, router]);

  if (loading) return <div><Loader/></div>;

  return null;
};

export default HomePageRedirect;
