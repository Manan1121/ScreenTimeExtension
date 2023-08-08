document.addEventListener('DOMContentLoaded', function() {
  
    // Sample data for the bar graph 
    const tabData = [
        { title: 'Google', timeSpent: 120 },
        { title: 'YouTube', timeSpent: 90 },
        { title: 'Facebook', timeSpent: 45 },
    ];

    console.log(document.getElementsByClassName("container"));

    new Vue({
        el: '#app',
        data: {
            tabs: tabData,
            darkMode: false
        },
        methods: {
            toggleDarkMode() {
                // Toggle the darkMode state when the switch is clicked
                this.darkMode = !this.darkMode;
            },
        },
        watch: {
            darkMode(newVal) {
                // Apply the dark mode CSS class to the container when dark mode is enabled
                if (newVal) {
                    document.getElementsByClassName("container").item(0).classList.add('dark-mode');
                } else {
                    document.getElementsByClassName("container").item(0).classList.remove('dark-mode');
                }
            },
        },
    });
});