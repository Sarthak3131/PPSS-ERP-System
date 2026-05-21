import React from 'react';
import Loader from './Loader';

export default function PageLoader({ label = 'Loading ERP module...' }) {
    return (
        <div className="flex min-h-[48vh] items-center justify-center px-4 py-10">
            <Loader label={label} />
        </div>
    );
}