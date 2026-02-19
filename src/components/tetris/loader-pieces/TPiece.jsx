import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const TPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`tPiece ${className}`}>
    <div />
    <div />
  </div>
));

TPiece.displayName = 'TPiece';
export default motion.create(TPiece);
