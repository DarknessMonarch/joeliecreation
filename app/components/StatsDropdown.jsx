"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/app/styles/stateDropdown.module.css";
import { MdKeyboardArrowDown as DropdownIcon } from "react-icons/md";

export default function Dropdown({
  options = [], 
  onSelect,
  Icon,
  dropPlaceHolder,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option.name);
    onSelect(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.dropdownInput} onClick={toggleDropdown}>
        {Icon && <span className={styles.icon}>{Icon}</span>}
        <span>{selectedOption || dropPlaceHolder}</span>
        <DropdownIcon className={styles.arrowIcon} />
      </div>

      {isOpen && (
        <div className={styles.dropdownArea}>
          {options.length > 0 ? (
            options.map((option) => (
              <span
                key={option.name}
                onClick={() => handleSelect(option)}
                className={styles.optionItem}
              >
                {option.name}
              </span>
            ))
          ) : (
            <span className={styles.noOptions}>No options available</span>
          )}
        </div>
      )}
    </div>
  );
}
