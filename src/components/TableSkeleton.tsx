import { Skeleton } from "~/components/ui/skeleton";
import { TableCell, TableRow } from "~/components/ui/table";

export default function TableSkeleton() {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {[...Array(25)].map((_, i) => (
        <TableRow key={i} className="h-2.5 border-[#4B4B4B] hover:bg-white/25">
          <TableCell>
            <Skeleton className="h-4 w-[100px] bg-gray-300" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px] bg-gray-300" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px] bg-gray-300" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px] bg-gray-300" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px] bg-gray-300" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
