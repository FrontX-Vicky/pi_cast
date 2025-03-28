import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';  // Use react-router-dom for routing
import { buttonVariants, Empty, EmptyDescription, EmptyImage, EmptyTitle } from 'keep-react';  // Assuming 'keep-react' works for your React app

export const EmptyErrorComponent = (props) => {
  const [imgUrl , setImageUrl] = useState('');
  useEffect(() => {
    if (props.status === 1) {
      setImageUrl('/images/error/successfull.PNG');
    } else if (props.status === 2) {
      // setImageUrl('../../images/error/error.svg');
      setImageUrl('https://staticmania.cdn.prismic.io/staticmania/a8befbc0-90ae-4835-bf37-8cd1096f450f_Property+1%3DSearch_+Property+2%3DSm.svg');
    } else {
      // Handle default case, e.g., set a default image if necessary
      setImageUrl('default_image_url'); // Example: replace with an actual default URL
    }
  },[]);
  return (
    <Empty>
      <EmptyImage>
        <img
          src={imgUrl}
          height={234}
          width={350}
          alt="404"
        />
      </EmptyImage>
      <EmptyTitle className="mb-[14px] mt-5">{props.message}!</EmptyTitle>
      <EmptyDescription className="mb-8">
        {props.description}
      </EmptyDescription>
      <Link to="/" className="text-white bg-blue-600 w-30 h-10 text-center rounded-md pt-2">
        Go to home
      </Link>
    </Empty>
  );
};
