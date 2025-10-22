import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    Dialog,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import axios from 'axios';
import { toast } from 'sonner';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { HiArrowPath } from "react-icons/hi2";


interface props {
    setOpen: (open: boolean) => void
}

const DownloadReport = ({ setOpen }: props) => {
    const [jsPDF, setJsPDF] = useState<typeof import("jspdf") | null>(null);
    const [XLSX, setXLSX] = useState<typeof import("xlsx") | null>(null);
    const [value, setValue] = useState<string>('Select File type');
    const [startdate, setStartDate] = useState<Date>();
    const [enddate, setEndDate] = useState<Date>();
    const [error, setError] = useState("");
    const [category, setCategory] = useState("*");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPopEnddate, setIsPopEndDate] = useState(false);
    const [Loading, setLoading] = useState<boolean>(false);
    const [showModal, setshowModal] = useState<boolean>(false);
    // const ReportsColumn: any = JSON.parse(sessionStorage.getItem("columns") as string)


    useEffect(() => {
        (async () => {
            const jsPDFModule = await import("jspdf");
            const xlsxModule = await import("xlsx");
            setJsPDF(jsPDFModule);
            setXLSX(xlsxModule);
        })();
    }, []);

    // 1. Preload the image before PDF generation
    function loadImageAsDataURL(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // If image is from a different origin
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                img.style.display = 'none'; // Hide the image if it fails to load
                reject(`Could not load image at ${src}`);
            };
            img.src = src;
        });
    }



    const exportData = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (startdate !== undefined && enddate !== undefined) {
            toast(
                `Your Request Submitted Wait For Download`
            );
            setLoading(true);
            setError("");
            const dataBody = {
                "startDate": format(startdate as any, 'yyyy-MM-dd'),
                "endDate": format(enddate as any, 'yyyy-MM-dd'),
                "category": category
            }
            var data = dataBody;
            await axios({
                method: "Post",
                url: `http://localhost:4000/uuids`,
                data,

            }).then(async (response) => {
                if (value === "PDF" && jsPDF) {
                    var pdfsize = 'a4';
                    var doc = new jsPDF.jsPDF('l', 'pt', pdfsize, true);

                    const headerDate = new Date().toLocaleDateString();
                    const pageWidth = doc.internal.pageSize.getWidth();

                    doc.setFillColor(84, 143, 227); // Set fill color to blue (RGB)
                    doc.rect(0, 0, pageWidth, 50, 'F'); // Draw a rectangle at the top
                    doc.setFont('times', 'bold');
                    doc.setTextColor(250, 250, 250);
                    doc.setFontSize(16);
                    doc.text('Archive Report', 350, 35);
                    // Sort columns by Order ascending (lowest number first)
                    const sortedColumns = [...ReportsColumn].sort((a, b) => a.Order - b.Order);

                    doc.setProperties({
                        title: 'API Data Report',
                    });
                    const columnsDetail = ['Total Object', 'Generated Date', 'Report Period']; // Adjust according to your data structure
                    autoTable(doc,
                        {
                            startY: 70,
                            useCss: true,
                            head: [columnsDetail], // Extract headers from columns,
                            body: [
                                [response.data.data.length, headerDate, `${format(startdate as any, 'yyyy-MM-dd')} to ${format(enddate as any, 'yyyy-MM-dd')}`],
                            ],
                            styles: {
                                cellPadding: 6, // Add some padding to cells
                                fontSize: 9,   // Adjust font size to fit the content
                                overflow: 'linebreak',
                                lineColor: [0, 0, 0], // Border color (black)
                                lineWidth: 0.1,       // Border width
                            },
                            headStyles: {
                                fillColor: [61, 39, 69], // Header background color (light gray) 
                                textColor: [250, 250, 250],
                                fontStyle: 'bold',
                                fontSize: 10,
                            },
                            alternateRowStyles: {
                                fillColor: [248, 248, 248], // Alternate row background color (slightly lighter gray)
                            },
                            margin: { right: 5, left: 5 },
                            tableWidth: "auto",
                        }
                    );

                    const columns = ReportsColumn;

                    let logoDataUrl: string | null = null;
                    try {
                        // logoDataUrl = await loadImageAsDataURL(`${basePath}img/Logo.png`);
                    } catch (error) {
                        // Logo will not be used, but PDF should continue
                        logoDataUrl = null;
                    }

                    // const rows = (response.data.data).map((item: any) => ({
                    //     objectName: item.am_object_name,
                    //     category: item.am_object_category,
                    //     objectSize: item.am_objectSize,
                    //     archiveDate: item.am_archiveDate,
                    //     Media: item.media,
                    //     bucket: item.bucket,
                    //     type: item.type,
                    // }));

                    const rows = response.data.data.map((item: any) => {
                        const row: Record<string, any> = {};
                        columns.forEach((col: any) => {
                            row[col.header] = item[col.dataKey]; // header becomes key
                        });
                        return row;
                    });

                    // const rowData = rows.map((row: any) => Object.values(row));
                    const rowDataSorted = rows.map((row: any) => sortedColumns.map(c => row[c.header]));
                    // console.log(rowDataSorted, "rowDataSorted", rowData)
                    autoTable(doc,
                        {
                            startY: 130,
                            useCss: true,
                            // head: [columns.map((col: any) => col.header)], // Extract headers from columns,
                            // body: rowData,
                            head: [sortedColumns.map(c => c.header)],
                            body: rowDataSorted,
                            // columnStyles: { text: { cellWidth: 'auto' } },
                            // columnStyles: {
                            //     0: { cellWidth: 215, },
                            //     1: { cellWidth: 55, },
                            //     2: { cellWidth: 60 },
                            //     3: { cellWidth: 100 },
                            //     4: { cellWidth: 95 },
                            //     5: { cellWidth: 240 },
                            //     6: { cellWidth: 65 },
                            // },
                            styles: {
                                cellPadding: 6, // Add some padding to cells
                                fontSize: 9,   // Adjust font size to fit the content
                                overflow: 'linebreak',
                                lineColor: [0, 0, 0], // Border color (black)
                                lineWidth: 0.1,       // Border width
                            },
                            headStyles: {
                                fillColor: [61, 39, 69], // Header background color (light gray) 
                                textColor: [250, 250, 250],
                                fontStyle: 'bold',
                                fontSize: 10,
                            },
                            // didDrawPage: function (data) {
                            //     const pageCount = doc.getNumberOfPages();
                            //     doc.addImage(`${basePath}img/Logo.png`, 'PNG', 5, 10, 70, 40);
                            //     doc.saveGraphicsState();
                            //     doc.setGState(doc.GState({ opacity: 0.1 }));
                            //     doc.addImage(`${basePath}img/Logo.png`, 'PNG', 200, 160, 450, 250);
                            //     doc.restoreGraphicsState();

                            //     // Footer with page number
                            //     const pageStr = `Page ${pageCount}`;
                            //     const textWidth = doc.getTextWidth(pageStr);
                            //     doc.setFontSize(12);
                            //     doc.setFont('times', 'bold');
                            //     doc.setTextColor(252, 0, 0);
                            //     doc.text(pageStr, (pageWidth - textWidth) / 2, pageHeight - 10);
                            // },
                            // didDrawPage: function (data) {
                            //     const pageCount = doc.getNumberOfPages();

                            //     const addImageIfExists = (
                            //         doc: jsPDF,                    // instance of jsPDF
                            //         src: string,                   // image path or URL
                            //         format: 'PNG' | 'JPEG' | 'WEBP', // accepted image formats by jsPDF
                            //         x: number,
                            //         y: number,
                            //         width: number,
                            //         height: number,
                            //         callback?: () => void          // optional callback
                            //     ): void => {
                            //         const img = new Image();
                            //         img.onload = () => {
                            //             doc.addImage(img, format, x, y, width, height);
                            //             callback?.();
                            //         };
                            //         img.onerror = () => {
                            //             console.warn(`Image not found: ${src}`);
                            //             callback?.();
                            //         };
                            //         img.src = src;
                            //     };

                            //     // Try adding logo at top
                            //     addImageIfExists(doc, `${basePath}img/Logo.png`, 'PNG', 5, 10, 70, 40, () => {
                            //         doc.saveGraphicsState();
                            //         doc.setGState(doc.GState({ opacity: 0.1 }));

                            //         // Try adding faded background logo
                            //         addImageIfExists(doc, `${basePath}img/Logo.png`, 'PNG', 5, 10, 70, 40, () => {
                            //             doc.restoreGraphicsState();

                            //             // Footer with page number
                            //             const pageStr = `Page ${pageCount}`;
                            //             const textWidth = doc.getTextWidth(pageStr);
                            //             doc.setFontSize(12);
                            //             doc.setFont('times', 'bold');
                            //             doc.setTextColor(252, 0, 0);
                            //             doc.text(pageStr, (pageWidth - textWidth) / 2, pageHeight - 10);
                            //         });
                            //     });
                            // },

                            didDrawPage: function () {
                                const pageCount = doc.getNumberOfPages();
                                if (logoDataUrl) {
                                    doc.addImage(logoDataUrl, 'PNG', 5, 10, 70, 40);
                                    doc.saveGraphicsState();
                                    doc.setGState(doc.GState({ opacity: 0.1 }));
                                    doc.addImage(logoDataUrl, 'PNG', 200, 160, 450, 250);
                                    doc.restoreGraphicsState();
                                }

                                const pageStr = `Page ${pageCount}`;
                                const textWidth = doc.getTextWidth(pageStr);
                                doc.setFontSize(12);
                                doc.setFont('times', 'bold');
                                doc.setTextColor(252, 0, 0);
                                doc.text(pageStr, (doc.internal.pageSize.getWidth() - textWidth) / 2, doc.internal.pageSize.getHeight() - 10);
                            },
                            margin: { right: 5, left: 5, top: 70 },
                            tableWidth: "auto",
                        }
                    );
                    doc.output('dataurlnewwindow');
                    doc.save(`Archive_Report_${headerDate}.pdf`);
                    setError("");
                    setLoading(false);
                    toast(
                        `Your Request Submitted For Download Completed`
                    )

                } else if (value === "Excel" && XLSX) {
                    try {
                        const headerDate = new Date().toLocaleDateString();
                        const columns = ReportsColumn;

                        // ✅ Sort columns first
                        const sortedColumns = [...ReportsColumn].sort((a, b) => a.Order - b.Order);

                        // Build rows with dataKey as keys (recommended)
                        const rows = response.data.data.map((item: any) => {
                            const row: Record<string, any> = {};
                            sortedColumns.forEach(col => {
                                row[col.header] = item[col.dataKey];
                            });
                            return row;
                        });

                        if (rows.length === 0) {
                            console.error('No data available');
                            return;
                        }
                        const mappedDetailData = [{
                            'Total Object': response.data.data.length,
                            'Generated Date': headerDate,
                            'Report Period': `${format(startdate as any, 'yyyy-MM-dd')} to ${format(enddate as any, 'yyyy-MM-dd')}`,
                        }];
                        const wsData: any[] = [];
                        const detailHeaders = ['Total Object', 'Generated Date', 'Report Period'];
                        wsData.push(detailHeaders);

                        mappedDetailData.forEach((row: any) => {
                            const rowArray = detailHeaders.map(header => row[header] || '');
                            wsData.push(rowArray);
                        });



                        const emptyRow = Array(detailHeaders.length).fill('');
                        wsData.push(emptyRow, emptyRow);
                        const mainHeaders = sortedColumns.map(col => col.header);
                        wsData.push(mainHeaders);
                        // Excel rows in ordered columns
                        rows.forEach((row: any) => {
                            const rowArray = sortedColumns.map(col => row[col.header]);
                            wsData.push(rowArray);
                        });
                        // rows.forEach((row: any) => {
                        //     const rowArray = columns.map((col: any) => row[col.header]); // ✅ use header
                        //     wsData.push(rowArray);
                        // });
                        // --- AUTO WIDTH CALCULATION ---
                        const colWidths: number[] = wsData[0].map((_: any, colIdx: number) => {
                            // compute the max length of data in each column
                            return Math.max(
                                ...wsData.map((row: any[]) =>
                                    row[colIdx] ? String(row[colIdx]).length : 0
                                )
                            );
                        });

                        // optional padding so it's not too tight
                        const padding = 2;
                        const cols = colWidths.map(w => ({ wch: w + padding }));

                        const ws = XLSX.utils.aoa_to_sheet(wsData);
                        ws['!cols'] = cols;   // 👈 assign calculated widths 
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Data Sheet');
                        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
                        const buf = new ArrayBuffer(wbout.length);
                        const view = new Uint8Array(buf);
                        for (let i = 0; i < wbout.length; i++) {
                            view[i] = wbout.charCodeAt(i) & 0xff;
                        }
                        const blob = new Blob([buf], { type: 'application/octet-stream' });

                        // Save the file
                        saveAs(blob, `Archive Data Report_${headerDate}.xlsx`);
                        setError("");
                        setLoading(false);
                        toast(
                            `Your Request Submitted For Download Completed`
                        )
                    } catch (error) {
                        console.error('Error downloading file:', error);
                        setError("Failed to download the report.");
                        setLoading(false);
                    }
                } else {
                    setError("File Type Not Selected");
                    setLoading(false);
                }
            }).catch(function (error) {
                console.log(error, "Error")
                setLoading(false);
                if (error.response.data.status === 1004) {
                    setshowModal(true);
                }
            });
        } else {
            toast(
                `Select Date`
            );
            setLoading(false);
        }
    }, [error, value, startdate, enddate, category, Loading])


    return (
        <DialogContent
            className="flex flex-col resize overflow-hidden bg-[#1f2937] border-2 border-slate-950  sm:max-w-[425px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={() => setOpen(false)}
        >
            <DialogHeader className="pb-4">
                <DialogTitle className="text-white"> Download Report</DialogTitle>
                <DialogDescription></DialogDescription>
            </DialogHeader>

            <div className="w-full border-stroke dark:border-strokedark">
                <div className="w-full p-2">
                    <form>
                        {/* <form onSubmit={(e) => exportData(e)}> */}
                        <div className="max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            <div className="mb-5 grid-cols-[35%_65%] grid items-end">
                                <span className="grid-cols-1">
                                    <Label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date:</Label>
                                </span>
                                <span className="grid-cols-1">
                                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button className='pl-1 bg-[#2d3d52] text-white w-full h-9 rounded-lg justify-start hover:bg-[#3a4b63]'>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startdate ? format(startdate, "LLL dd, y") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startdate}
                                                onSelect={(e) => { setStartDate(e); setIsPopoverOpen(false) }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </span>
                            </div>
                            <div className="mb-5 grid-cols-[35%_65%] grid items-end">
                                <span className="grid-cols-1">
                                    <Label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Date:</Label>
                                </span>
                                <span className="grid-cols-1">
                                    <Popover open={isPopEnddate} onOpenChange={setIsPopEndDate}>
                                        <PopoverTrigger asChild>
                                            <Button id="date" className='pl-1 bg-[#2d3d52] text-white w-full h-9 rounded-lg justify-start hover:bg-[#3a4b63]'>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {enddate ? format(enddate, "LLL dd, y") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start">
                                            <Calendar
                                                mode="single"
                                                selected={enddate}
                                                onSelect={(e) => { setEndDate(e); setIsPopEndDate(false) }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </span>
                            </div>
                            <div className="mb-5 grid-cols-[35%_65%] grid items-end">
                                <span className="grid-cols-1">
                                    <Label className="block mb-2 text-sm font-medium text-white">Category:</Label>
                                </span>
                                <span className="grid-cols-1">
                                    <Input type="text" id="Category" value={category} onChange={(e) => setCategory(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg outline-none"
                                    />
                                </span>
                            </div>
                            <div className="mb-5 grid-cols-[35%_65%] grid items-end">
                                <span className="grid-cols-1">
                                    <Label className="block mb-2 text-sm font-medium text-white">Create File:</Label>
                                </span>
                                <span className="grid-cols-1">
                                    <Select value={value} onValueChange={(value) => setValue(value)}>
                                        <SelectTrigger className="w-[100%] bg-white text-black">
                                            <SelectValue> {value}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PDF">PDF</SelectItem>
                                            <SelectItem value="Excel">Excel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <DialogFooter className="sm:justify-center pt-2">
                                    <DialogClose asChild>
                                        <Button type="button" size='lg' className="bg-[#d94040] text-white rounded-md border border-black relative text-sm px-8 py-2 hover:bg-opacity">
                                            <span className="text-white">Close</span>
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" variant={"default"} size={'lg'}
                                        className='text-white rounded-md border border-black relative text-sm px-8 py-2transition hover:bg-opacity-90 bg-blue-700' disabled={Loading}>
                                        {Loading === false ? "Submit" : <HiArrowPath className='text-[#06b3ac] stroke-2 inline-block text-[17px]  animate-spin-slow' />}
                                    </Button>
                                </DialogFooter>
                            </div>
                            <div className="  w-full text-center p-4 text-red-500 font-medium text-lg subpixel-antialiased">
                                {error === "" ? null : error}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DialogContent>
    )
}

export default DownloadReport
