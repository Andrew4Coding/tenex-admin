import _ from 'lodash';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './grid-layout.css';

import { Plus, X } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

interface LayoutItem {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    static?: boolean;
}

interface Layouts {
    [breakpoint: string]: LayoutItem[];
}

interface Props {
    domElements: unknown[];
    className?: string;
    rowHeight?: number;
    onLayoutChange?: (layout: LayoutItem[], layouts: Layouts) => void;
    cols?: Record<string, number>;
    breakpoints?: Record<string, number>;
    containerPadding?: [number, number];
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const Dragable: FunctionComponent<Props> = (props) => {
    const {
        className = 'layout',
        rowHeight = 30,
        onLayoutChange = () => { },
        cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        containerPadding = [0, 0],
    } = props;

    const [layouts, setLayouts] = useState<Layouts>({
        lg: [], // Start with empty layout
    });
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
    const [compactType, setCompactType] = useState<'vertical' | 'horizontal' | null>('vertical');
    const [mounted, setMounted] = useState(false);
    const [toolbox] = useState<Layouts>({
        lg: [],
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const onBreakpointChange = useCallback((breakpoint: string) => {
        setCurrentBreakpoint(breakpoint);
    }, []);

    const handleLayoutChange = useCallback((layout: LayoutItem[], layouts: Layouts) => {
        setLayouts({ ...layouts });
        onLayoutChange(layout, layouts);
    }, [onLayoutChange]);

    const onDrop = useCallback((layout: LayoutItem[], layoutItem: LayoutItem) => {
        console.log('Element parameters:', JSON.stringify(layoutItem, ['x', 'y', 'w', 'h'], 2));
    }, []);

    const addNewItem = useCallback(() => {
        const newItem: LayoutItem = {
            x: (layouts.lg.length * 3) % 12,
            y: Math.floor(layouts.lg.length / 4) * 3,
            w: 4,
            h: 4,
            i: layouts.lg.length.toString(),
            static: false,
        };
        
        const newLayout = {
            ...layouts,
            lg: [...layouts.lg, newItem]
        };
        
        setLayouts(newLayout);
        onLayoutChange(newLayout.lg, newLayout);
    }, [layouts, onLayoutChange]);

    const deleteItem = useCallback((itemId: string) => {
        const newLayout = {
            ...layouts,
            lg: layouts.lg.filter(item => item.i !== itemId)
        };
        
        setLayouts(newLayout);
        onLayoutChange(newLayout.lg, newLayout);
    }, [layouts, onLayoutChange]);

    const generateDOM = useCallback(() => {
        return _.map(layouts.lg, (l, i) => (
            <div key={i} className="h-full w-full relative">
                <Card
                    className={cn(
                        'h-full w-full transition-all duration-200 hover:shadow-md bg-accent',
                        l.static && 'ring-2 ring-primary/20'
                    )}
                >
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                {l.static && (
                                    <Badge variant="secondary" className="text-xs">
                                        Static
                                    </Badge>
                                )}
                                <span>Item {i}</span>
                            </CardTitle>
                            {!l.static && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(l.i);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground">
                            {l.static ? (
                                <p>This item is static and cannot be removed or resized.</p>
                            ) : (
                                <p>Drag to move, resize handles to resize</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                {!l.static && (
                    <>
                        <div className="react-resizable-handle-bottom" />
                        <div className="react-resizable-handle-right" />
                    </>
                )}
            </div>
        ));
    }, [layouts.lg, deleteItem]);

    return (
        <div className="h-full w-full flex flex-col">
            <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none max-h-[80vh] overflow-hidden">
                <CardHeader className="flex-shrink-0 pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Dashboard Layout</CardTitle>
                        <Button onClick={addNewItem} size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Widget
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto min-h-0 rounded-lg grid-container">
                    <div className="min-h-full w-full">
                        <ResponsiveReactGridLayout
                            className="min-h-full w-full"
                            rowHeight={rowHeight}
                            onLayoutChange={handleLayoutChange}
                            cols={cols}
                            breakpoints={breakpoints}
                            containerPadding={containerPadding}
                            layouts={layouts}
                            measureBeforeMount={false}
                            useCSSTransforms={mounted}
                            compactType={compactType}
                            preventCollision={!compactType}
                            onBreakpointChange={onBreakpointChange}
                            onDrop={onDrop}
                            isDroppable
                            style={{ 
                                minHeight: '100%',
                                width: '100%'
                            }}
                        >
                            {generateDOM()}
                        </ResponsiveReactGridLayout>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dragable;
