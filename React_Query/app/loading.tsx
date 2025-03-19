'use client';

import { Spinner } from '@material-tailwind/react';
import React from 'react';

const loading = () => (
  <div className='h-full w-full flex items-center justify-center'>
    <Spinner className='w-12 h-12' />
  </div>
);

export default loading;
