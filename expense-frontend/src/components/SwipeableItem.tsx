import { ReactNode, useRef, useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableItemProps {
    children: ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function SwipeableItem({ children, onEdit, onDelete }: SwipeableItemProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isActionsVisible, setIsActionsVisible] = useState(false);

    const startX = useRef(0);
    const currentX = useRef(0);
    const itemRef = useRef<HTMLDivElement>(null);

    const SWIPE_THRESHOLD = 80; // Pixels to trigger action reveal
    const ACTION_WIDTH = 160; // Width of action buttons area

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isActionsVisible && itemRef.current && !itemRef.current.contains(event.target as Node)) {
                closeActions();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isActionsVisible]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        currentX.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;

        currentX.current = e.touches[0].clientX;
        const diff = startX.current - currentX.current;

        // Only allow swipe left (diff > 0) or closing swipe right when actions are visible
        if (diff > 0) {
            setTranslateX(Math.min(diff, ACTION_WIDTH));
        } else if (isActionsVisible && diff < 0) {
            setTranslateX(Math.max(ACTION_WIDTH + diff, 0));
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        const diff = startX.current - currentX.current;

        if (diff > SWIPE_THRESHOLD) {
            // Swiped left - show actions
            setTranslateX(ACTION_WIDTH);
            setIsActionsVisible(true);
        } else if (diff < -SWIPE_THRESHOLD && isActionsVisible) {
            // Swiped right while actions visible - close
            closeActions();
        } else {
            // Not enough swipe - return to position
            if (isActionsVisible) {
                setTranslateX(ACTION_WIDTH);
            } else {
                setTranslateX(0);
            }
        }
    };

    const closeActions = () => {
        setTranslateX(0);
        setIsActionsVisible(false);
    };

    const handleEdit = () => {
        closeActions();
        onEdit?.();
    };

    const handleDelete = () => {
        closeActions();
        onDelete?.();
    };

    return (
        <div
            ref={itemRef}
            className="relative overflow-hidden touch-pan-y"
        >
            {/* Action Buttons (behind the content) */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2">
                {onEdit && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleEdit}
                        className="h-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4"
                    >
                        <Edit2 className="h-5 w-5" />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="h-full rounded-lg px-4"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Swipeable Content */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateX(-${translateX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
                }}
                className="relative bg-card"
            >
                {children}
            </div>
        </div>
    );
}
