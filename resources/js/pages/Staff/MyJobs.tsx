import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowRightOnRectangleIcon,
  CheckIcon,
  PlayIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../components/Shared/PageHeader";
import { EmptyState, LoadingState, Panel } from "../../components/Shared/ui";
import { InstallAppButton, InstallBanner } from "../../components/Shared/InstallApp";
import JobOrderDetailsModal from "../../components/Admin/JobOrders/JobOrderDetailsModal";
import { canStartJob, getInspectionState, startBlockReason } from "../../components/Admin/JobOrders/jobOrderHelpers";
import JobOrderCard from "../../components/Admin/JobOrders/JobOrderCard";
import {
  completeJobOrder,
  getJobOrders,
  startJobOrder,
  type JobOrder,
} from "../../api/JobOrderManagement/jobOrderApi";
import { logout } from "../../api/UserManagement/authApi";
import { clearAuth, getUser } from "../../utils/auth";

const TABS = [
  { key: "todo", label: "To do", statuses: ["pending", "assigned"] },
  { key: "doing", label: "In progress", statuses: ["in_progress"] },
  { key: "done", label: "Done", statuses: ["completed"] },
];

// Mechanics and washers see only the jobs assigned to them.
export default function MyJobs() {
  const toast = useToast();
  const navigate = useNavigate();
  const user = getUser();
  const [jobs, setJobs] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [openId, setOpenId] = useState<number | null>(() => Number(searchParams.get("open")) || null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setJobs(await getJobOrders());
    } catch (error: any) {
      toast({ title: error?.response?.data?.message ?? "Could not load your jobs.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => jobs.filter((job) => TABS[tab].statuses.includes(job.status)),
    [jobs, tab],
  );

  const act = async (job: JobOrder, action: "start" | "finish") => {
    setBusyId(job.id);
    try {
      await (action === "start" ? startJobOrder(job.id) : completeJobOrder(job.id));
      toast({ title: action === "start" ? "Job started" : "Job marked as done", status: "success", duration: 2500 });
      await load();
    } catch (error: any) {
      toast({ title: error?.response?.data?.message ?? "Could not update the job.", status: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Token may already be gone; clear locally anyway.
    }
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="dark.800" color="white" borderBottom="3px solid" borderColor="brand.600">
        <Container maxW="6xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Image src="/logo.jpg" alt="AUTO CDO" h="36px" borderRadius="md" />
              <Box>
                <Text fontWeight="800" color="white" lineHeight="1.2">My Jobs</Text>
                <Text fontSize="xs" color="gray.300">
                  {user?.username} · {user?.role?.name}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={2}>
            <InstallAppButton display={{ base: "none", md: "inline-flex" }} />
            <Button
              size="sm"
              variant="outline"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.200" }}
              leftIcon={<ArrowRightOnRectangleIcon width={16} />}
              onClick={handleLogout}
            >
              Log out
            </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py={5}>
        <Stack spacing={4}>
          <InstallBanner />
          <PageHeader
            title="Assigned to you"
            subtitle="Start a job when you begin, add the parts you used, then mark it done."
            onRefresh={load}
            refreshing={loading}
          />

          <Panel px={{ base: 2, md: 4 }} pt={2}>
            <Tabs index={tab} onChange={setTab} colorScheme="brand" isFitted>
              <TabList borderBottomWidth="1px">
                {TABS.map((t) => (
                  <Tab key={t.key} fontSize="sm" fontWeight="600" px={1} whiteSpace="nowrap">
                    {t.label}
                    <Badge ml={2} borderRadius="full" fontSize="10px">
                      {jobs.filter((job) => t.statuses.includes(job.status)).length}
                    </Badge>
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            <Box py={4} px={{ base: 2, md: 0 }}>
              {loading ? (
                <LoadingState label="Loading your jobs…" />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={WrenchScrewdriverIcon}
                  title={tab === 2 ? "No finished jobs yet" : "Nothing here"}
                  message={tab === 0 ? "New jobs from the office will show up here." : undefined}
                />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {visible.map((job) => (
                    <JobOrderCard
                      key={job.id}
                      jobOrder={job}
                      onView={(item) => setOpenId(item.id)}
                      actions={
                        ["pending", "assigned"].includes(job.status) ? (
                          canStartJob(job) ? (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<PlayIcon width={16} />}
                              isLoading={busyId === job.id}
                              onClick={() => act(job, "start")}
                            >
                              Start
                            </Button>
                          ) : getInspectionState(job) === "needed" ? (
                            <Button
                              size="sm"
                              colorScheme="yellow"
                              leftIcon={<ClipboardDocumentCheckIcon width={16} />}
                              onClick={() => setOpenId(job.id)}
                            >
                              Inspect
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" colorScheme="orange" isDisabled>
                              {startBlockReason(job)}
                            </Button>
                          )
                        ) : job.status === "in_progress" ? (
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<CheckIcon width={16} />}
                            isLoading={busyId === job.id}
                            onClick={() => act(job, "finish")}
                          >
                            Mark done
                          </Button>
                        ) : undefined
                      }
                    />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Panel>
        </Stack>
      </Container>

      <JobOrderDetailsModal
        jobOrder={jobs.find((job) => job.id === openId) ?? null}
        isOpen={openId !== null}
        onClose={() => setOpenId(null)}
        onChanged={load}
      />
    </Box>
  );
}
