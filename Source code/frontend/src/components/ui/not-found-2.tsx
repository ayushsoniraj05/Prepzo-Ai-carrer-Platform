import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "lucide-react";

interface NotFoundProps {
  onNavigate?: (page: string) => void;
}

export function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
            404
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            The page you're looking for might have been <br />
            moved or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild onClick={() => onNavigate && onNavigate('dashboard')}>
              <button>
                <HomeIcon className="size-4 mr-2" data-icon="inline-start" /> Go
                Home
              </button>
            </Button>
            <Button asChild variant="outline" onClick={() => onNavigate && onNavigate('jobs')}>
              <button>
                <CompassIcon className="size-4 mr-2" data-icon="inline-start" />{" "}
                Explore
              </button>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
