import {
    Box,
    Button,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useClipboard,
    useDisclosure,
} from "@chakra-ui/react";
import { PrinterIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

interface Props {
    path: string;
    title: string;
    subtitle?: string;
    label?: string;
    compact?: boolean;
}

export default function QrCodeButton({ path, title, subtitle, label = "QR code", compact = false }: Props) {
    const modal = useDisclosure();
    const printable = useRef<HTMLDivElement>(null);
    const url = `${window.location.origin}${path}`;
    const clipboard = useClipboard(url);

    const handlePrint = () => {
        const content = printable.current?.innerHTML;
        if (!content) return;
        const win = window.open("", "_blank", "width=420,height=560");
        if (!win) return;
        win.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:24px}h2{margin:12px 0 4px;font-size:20px}p{margin:0;color:#555;font-size:13px}small{display:block;margin-top:10px;color:#888;font-size:10px;word-break:break-all}</style></head><body>${content}<script>window.onload=()=>{window.print();}</scr` + `ipt></body></html>`);
        win.document.close();
    };

    return (
        <>
            {compact ? (
                <Tooltip label={label} hasArrow>
                    <IconButton aria-label={label} size="sm" variant="outline" icon={<QrCodeIcon width={18} />} onClick={modal.onOpen} />
                </Tooltip>
            ) : (
                <Button size="sm" variant="outline" leftIcon={<QrCodeIcon width={16} />} onClick={modal.onOpen}>
                    {label}
                </Button>
            )}
            <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="sm" isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader fontSize="md">{label}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box ref={printable} textAlign="center">
                            <Box display="inline-block" p={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg">
                                <QRCodeSVG value={url} size={220} level="M" marginSize={1} />
                            </Box>
                            <h2 style={{ fontWeight: 800, fontSize: 18, marginTop: 12 }}>{title}</h2>
                            {subtitle && <p style={{ color: "#555", fontSize: 13 }}>{subtitle}</p>}
                            <small style={{ display: "block", marginTop: 8, color: "#888", fontSize: 10, wordBreak: "break-all" }}>{url}</small>
                        </Box>
                        <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
                            Scan with a phone camera to open this record.
                        </Text>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button size="sm" variant="ghost" onClick={clipboard.onCopy}>
                            {clipboard.hasCopied ? "Copied" : "Copy link"}
                        </Button>
                        <Button size="sm" colorScheme="brand" leftIcon={<PrinterIcon width={16} />} onClick={handlePrint}>
                            Print
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
