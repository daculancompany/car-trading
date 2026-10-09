import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Button,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";

import {
  getVehicleExpenses,
  type VehicleExpense,
} from "../../../api/ExpenseManagement/expenseApi";

import Pagination from "../../../Reusable/Paginations";

interface VehicleExpensesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VehicleExpensesSummaryModal({
  isOpen,
  onClose,
}: VehicleExpensesSummaryModalProps) {
  const toast = useToast();
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isOpen) return;

    const loadExpenses = async () => {
      try {
        setLoading(true);
        setExpenses(await getVehicleExpenses());
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to load vehicle expenses:", error);
        toast({
          title: "Expenses failed",
          description: "Unable to load vehicle expenses.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    void loadExpenses();
  }, [isOpen, toast]);

  const totalAmount = expenses.reduce(
    (total, expense) => total + Number(expense.amount ?? 0),
    0,
  );

  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vehicle Expenses Overview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={4}
            mb={5}
          >
            <Box
              p={4}
              bg="brand.50"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="lg"
            >
              <Text fontSize="xs" color="gray.700">
                Total Expense Amount
              </Text>

              <Text
                fontSize="md"
                fontWeight="700"
                color="dark.800"
              >
                {formatCurrency(totalAmount)}
              </Text>
            </Box>

            <Box
              p={4}
              bg="gray.100"
              border="1px solid"
              borderColor="gray.50"
              borderRadius="lg"
            >
              <Text fontSize="xs" color="gray.700">
               Total Expense Records
              </Text>

              <Text
                fontSize="md"
                fontWeight="700"
                color="dark.800"
              >
                {expenses.length}
              </Text>
            </Box>
          </SimpleGrid>

          {loading ? (
            <Flex justify="center" py={12}><Spinner /></Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" minW="900px">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Stock No.</Th>
                    <Th>Vehicle</Th>
                    <Th>Expense Type</Th>
                    <Th isNumeric>Expense Amount</Th>
                    <Th>Expense Date</Th>
                    <Th>Remarks</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedExpenses.length === 0 ? (
                    <Tr><Td colSpan={6} textAlign="center" py={10} color="gray.500">No expense records found.</Td></Tr>
                  ) : paginatedExpenses.map((expense) => (
                    <Tr key={expense.id}>
                      <Td fontWeight="600">{expense.vehicle?.stock_no ?? "-"}</Td>
                      <Td py={2}>{[expense.vehicle?.brand?.brand, expense.vehicle?.model?.model, expense.vehicle?.variant?.variant].filter(Boolean).join(" ") || "-"}</Td>
                      <Td py={2}>
                        <Badge
                          bg="brand.100"
                          color=".700"
                          fontWeight="500"
                        >
                          {expense.expenseType?.expense_name ??
                            expense.expense_type?.expense_name ??
                            "-"}
                        </Badge>
                      </Td>
                      <Td py={2} isNumeric fontWeight="700">{formatCurrency(Number(expense.amount ?? 0))}</Td>
                      <Td py={2}>{expense.created_at ? new Date(expense.created_at).toLocaleDateString("en-PH") : "-"}</Td>
                      <Td py={2} maxW="220px" whiteSpace="normal">{expense.remarks || "-"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={expenses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="expense record"
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
