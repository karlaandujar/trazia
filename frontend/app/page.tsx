"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export default function Home() {
  type Course = {
    id: number;
    course_number: string;
    course_name: string;
  };

  const [courses, setCourses] = useState<Course[]>([]);
  

  useEffect(() => {
    fetch("http://127.0.0.1:8000/courses")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Courses</h1>

      <div className="flex justify-center mt-8">
        <table className="border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 px-4 py-1">Course Number</th>
              <th className="border border-gray-400 px-4 py-1">Course Name</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border border-gray-400 px-4 py-1">{course.course_number}</td>
                <td className="border border-gray-400 px-4 py-1">{course.course_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
