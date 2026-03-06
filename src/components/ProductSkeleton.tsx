import React from 'react';
import Skeleton from './ui/Skeleton';

const ProductSkeleton = () => {
    return (
        <div className="rounded-2xl border border-primary/5 bg-surface overflow-hidden">
            <Skeleton className="aspect-square w-full sm:aspect-[4/5]" />
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="25%" height={24} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <Skeleton width="40%" height={16} />
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
