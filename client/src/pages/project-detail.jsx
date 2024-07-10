import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

const ProjectDetails = () => {
    const [project, setProject] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    
    const {id} = useParams();
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
          const fetchProject = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error('No token found');
              return;
            }
    
            try {
              const response = await fetch(`${apiUrl}/projects/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (!response.ok) {
                throw new Error('Failed to fetch project');
              }
              const data = await response.json();
              setProject({
                name: data.name,
                description: data.description,
                startDate: data.startDate.split('T')[0],
                endDate: data.endDate.split('T')[0]
              });
            } catch (error) {
              console.error('Error fetching project:', error);
            }
          };
    
          fetchProject();
        }
      }, [id, apiUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if(!token){
            console.error('No token found');
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/projects/${id}` : `${apiUrl}/projects`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(project)
            });

            if(!response.ok){
                throw new Error('Failed to save project');
            };

            navigate('/projects');

        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    return (
        <div className="container mt-4">
          <h1 className="text-center">{id ? 'Update Project' : 'Create Project'}</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={project.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={project.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                name="startDate"
                value={project.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                name="endDate"
                value={project.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {id ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      );
    };
    
    export default ProjectDetails;