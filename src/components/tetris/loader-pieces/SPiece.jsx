import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const SPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`sPiece ${className}`}>
    <div />
    <div />
  </div>
));

SPiece.displayName = 'SPiece';
export default motion.create(SPiece);
