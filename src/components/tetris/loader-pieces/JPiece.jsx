import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const JPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`jPiece ${className}`}>
    <div />
    <div />
  </div>
));

JPiece.displayName = 'JPiece';
export default motion.create(JPiece);
