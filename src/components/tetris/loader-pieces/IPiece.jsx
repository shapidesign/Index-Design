import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const IPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`iPiece ${className}`}>
    <div />
  </div>
));

IPiece.displayName = 'IPiece';
export default motion.create(IPiece);
