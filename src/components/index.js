// src/components/index.js

import React from 'react';
import './ComponentA.css'; // Example of component-specific styles
import './ComponentB.css'; // Example of component-specific styles

export const ComponentA = () => {
    return (
        <div className="component-a">
            <h1>Hello from Component A</h1>
        </div>
    );
};

export const ComponentB = () => {
    return (
        <div className="component-b">
            <h2>Hello from Component B</h2>
        </div>
    );
};

// You can add more components or functions as needed