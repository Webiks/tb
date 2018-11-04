import * as React from 'react';

const Title = ({ title, isExist }) => (
    <h1 style={{ textTransform: 'capitalize' }}>
        {
            isExist ? `${title}` : <div>
                <span style={{ color: 'gold' }}> ⚠ </span>
                <span>{title} doesn't exist!</span>
            </div>
        }
    </h1>
);

export default Title;