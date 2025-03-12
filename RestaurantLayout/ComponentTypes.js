export default {
    Table:{
        DefaultSize:{
            x:1,
            y:1,
        },

        constructor: function(Component){
            Component.textContent = Component.parentElement.PrimaryKey
        }
    },
}