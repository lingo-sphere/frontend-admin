import TableCourse from "@/components/admin/course/table.course";
const ManageCoursePage = () => {
    return (
        <div>
            {/* <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                {t.menu.books}
            </Title> */}
            <TableCourse />
        </div>
    );
};

export default ManageCoursePage;
