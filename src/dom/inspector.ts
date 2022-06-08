/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

namespace _blank {
    $('#einspector').on('matterCreated', function (e, eventInfo) { 
        // originates from phys() in phys.ts
        // alert('(notifier1)The value of eventInfo is: ' + eventInfo);
        console.log('observed creation of ' + eventInfo['matter'].toString())
    });
    // TODO
    // since we are given mixin creation functions for each phase, we can reflexively discover the attributes that each subclass of substance creates
    // so we can show them in the inspector

    function showAttributes(subs: Substance): string {
        let subs2 = subs as MolecularSubstance;
        // subs2.type.
        let attrs = ['mass', 'volume', 'temperature', 'state', 'mol', 'molarMass'];
        let s = '\n';
        for (let attr of attrs) {
            if(attr in subs) {
                let result = (subs as any)[attr];
                s += `${attr}: ${(subs as any)[attr]}\n`;
                
            }
        }
        return s;
    }

    $('#einspector').on('substanceCreated', function (e, eventInfo) { 
        // originates from tang() in physvis.ts, which itself calls phys() but also adds it to glob.s
        let subs = eventInfo['substance'] as Substance;
        console.log('observed appendage of ' + subs.toString() + ' to the glob');
        let globule = document.createElement('div');
        globule.classList.add('globule');
        globule.textContent = subs.physhook!.label;
        $('#einspector')[0].append(globule);


        // when clicked, show the substance's properties
        let $globule = $(globule);
        $globule.on('click', function () {
            // expand the div
            $globule.toggleClass('expanded');
            if($globule.hasClass('expanded')){
                let child = document.createElement('code');
                child.classList.add('substance-attributes')
                child.textContent = showAttributes(subs);
                // add child to $globule
                $globule.append(child);
            } else {
                // remove child from $globule
                $globule.children('code.substance-attributes').remove();
            }
            // show the substance's properties
        });

    });
}